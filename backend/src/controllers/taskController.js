import Task from '../models/Task.js';
import Employee from '../models/Employee.js';
import HttpError from '../utils/HttpError.js';
import { ACTIVE_TASK_STATUSES, MAX_ACTIVE_TASKS } from '../constants/workforce.js';
import { dateRange, paginated, pagination } from '../utils/query.js';

const active = { $in: ACTIVE_TASK_STATUSES };
async function queryFilter(query) {
  const filter = {};
  if (query.search?.trim()) {
    const matchingEmployees = await Employee.find({ name: { $regex: query.search.trim(), $options: 'i' } }).distinct('_id');
    filter.$or = [{ title: { $regex: query.search.trim(), $options: 'i' } }, { employee: { $in: matchingEmployees } }];
  }
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.department) filter.department = query.department;
  if (query.dueDate) { const range = dateRange(query.dueDate); if (range) filter.dueDate = range; }
  return filter;
}

export async function listTasks(req, res) {
  const { page, limit, skip } = pagination(req.query);
  const filter = await queryFilter(req.query);
  const sortField = ['createdAt', 'dueDate', 'priority', 'title'].includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
  const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const sort = sortField === 'priority' ? { priority: 1 } : { [sortField]: req.query.order === 'asc' ? 1 : -1 };
  const [data, total] = await Promise.all([Task.find(filter).populate('employee', 'name email').sort(sort).skip(skip).limit(limit).lean(), Task.countDocuments(filter)]);
  if (sortField === 'priority') data.sort((a, b) => (priorityOrder[a.priority] - priorityOrder[b.priority]) * (req.query.order === 'asc' ? 1 : -1));
  res.json(paginated(data, total, page, limit));
}

export async function getTask(req, res) {
  const task = await Task.findById(req.params.id).populate('employee', 'name email department status').lean();
  if (!task) throw new HttpError(404, 'Task not found');
  res.json(task);
}

async function validateAssignment({ employeeId, department, startDate, currentTaskId }) {
  if (!employeeId) return null;
  const employee = await Employee.findById(employeeId);
  if (!employee) throw new HttpError(400, 'Choose an existing employee.');
  if (employee.status === 'Inactive') throw new HttpError(400, 'Inactive employees cannot be assigned tasks.');
  const start = new Date(startDate);
  if (employee.status === 'On Leave' && employee.leaveStart && employee.leaveEnd && start >= employee.leaveStart && start <= employee.leaveEnd) {
    throw new HttpError(400, 'This employee is on leave during the task start date. Choose another employee or a date outside the leave period.');
  }
  if (employee.department !== department) throw new HttpError(400, 'The task department must match the assigned employee department.');
  const count = await Task.countDocuments({ employee: employee._id, status: { $in: ACTIVE_TASK_STATUSES }, ...(currentTaskId ? { _id: { $ne: currentTaskId } } : {}) });
  if (count >= MAX_ACTIVE_TASKS) throw new HttpError(400, `An employee can have at most ${MAX_ACTIVE_TASKS} active tasks at a time.`);
  return employee;
}

export async function createTask(req, res) {
  if (new Date(req.body.dueDate) < new Date(req.body.startDate)) throw new HttpError(400, 'Due date cannot be earlier than start date.');
  const employee = await validateAssignment({ employeeId: req.body.employee, department: req.body.department, startDate: req.body.startDate });
  const task = await Task.create({ ...req.body, employee: employee?._id || null, employeeSnapshot: employee ? { name: employee.name, email: employee.email } : undefined, status: 'Todo', completedDate: null });
  res.status(201).json(await task.populate('employee', 'name email'));
}

export async function updateTask(req, res) {
  const task = await Task.findById(req.params.id);
  if (!task) throw new HttpError(404, 'Task not found');
  if (['Completed', 'Cancelled'].includes(task.status)) throw new HttpError(400, 'Completed or cancelled tasks cannot be edited.');
  if (req.body.status || Object.hasOwn(req.body, 'completedDate')) throw new HttpError(400, 'Update task status through the status endpoint.');
  const startDate = req.body.startDate ?? task.startDate;
  const dueDate = req.body.dueDate ?? task.dueDate;
  if (new Date(dueDate) < new Date(startDate)) throw new HttpError(400, 'Due date cannot be earlier than start date.');
  const employeeId = Object.hasOwn(req.body, 'employee') ? req.body.employee : task.employee;
  const department = req.body.department ?? task.department;
  const employee = await validateAssignment({ employeeId, department, startDate, currentTaskId: task._id });
  Object.assign(task, req.body, { employee: employee?._id || null, employeeSnapshot: employee ? { name: employee.name, email: employee.email } : task.employeeSnapshot });
  await task.save();
  res.json(await task.populate('employee', 'name email'));
}

const transitions = { Todo: ['In Progress', 'Cancelled'], 'In Progress': ['Completed', 'Cancelled'] };
export async function updateTaskStatus(req, res) {
  const task = await Task.findById(req.params.id);
  if (!task) throw new HttpError(404, 'Task not found');
  if (!transitions[task.status]?.includes(req.body.status)) throw new HttpError(400, `A task in ${task.status} cannot move to ${req.body.status}.`);
  task.status = req.body.status;
  task.completedDate = req.body.status === 'Completed' ? new Date() : null;
  await task.save();
  res.json(await task.populate('employee', 'name email'));
}

export async function deleteTask(req, res) {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) throw new HttpError(404, 'Task not found');
  res.status(204).end();
}

export async function exportTasks(req, res) {
  const filter = await queryFilter(req.query);
  const tasks = await Task.find(filter).populate('employee', 'name email').sort({ createdAt: -1 }).lean();
  const columns = ['title', 'description', 'employee', 'department', 'priority', 'status', 'startDate', 'dueDate', 'completedDate'];
  const escape = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const rows = tasks.map(t => [t.title, t.description, t.employee?.name || t.employeeSnapshot?.name, t.department, t.priority, t.status, t.startDate, t.dueDate, t.completedDate].map(escape).join(','));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="tasks.csv"');
  res.send([columns.map(escape).join(','), ...rows].join('\r\n'));
}

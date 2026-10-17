import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import HttpError from '../utils/HttpError.js';
import { ACTIVE_TASK_STATUSES } from '../constants/workforce.js';
import { paginated, pagination } from '../utils/query.js';

export async function listEmployees(req, res) {
  const { page, limit, skip } = pagination(req.query);
  const filter = {};
  if (req.query.search) filter.$or = ['name', 'email', 'role'].map(key => ({ [key]: { $regex: req.query.search.trim(), $options: 'i' } }));
  if (req.query.department) filter.department = req.query.department;
  if (req.query.status) filter.status = req.query.status;
  const sort = { [req.query.sortBy || 'name']: req.query.order === 'desc' ? -1 : 1 };
  const [data, total] = await Promise.all([Employee.find(filter).sort(sort).skip(skip).limit(limit).lean(), Employee.countDocuments(filter)]);
  const counts = await Task.aggregate([{ $match: { employee: { $in: data.map(e => e._id) }, status: { $in: ACTIVE_TASK_STATUSES } } }, { $group: { _id: '$employee', count: { $sum: 1 } } }]);
  const workload = new Map(counts.map(row => [String(row._id), row.count]));
  res.json(paginated(data.map(e => ({ ...e, activeTaskCount: workload.get(String(e._id)) || 0 })), total, page, limit));
}

export async function getEmployee(req, res) {
  const employee = await Employee.findById(req.params.id).lean();
  if (!employee) throw new HttpError(404, 'Employee not found');
  const tasks = await Task.find({ employee: employee._id }).sort({ createdAt: -1 }).lean();
  res.json({ ...employee, tasks });
}

export async function createEmployee(req, res) {
  const employee = await Employee.create(req.body);
  res.status(201).json(employee);
}

export async function updateEmployee(req, res) {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!employee) throw new HttpError(404, 'Employee not found');
  res.json(employee);
}

export async function deleteEmployee(req, res) {
  const employee = await Employee.findById(req.params.id);
  if (!employee) throw new HttpError(404, 'Employee not found');
  const activeTasks = await Task.countDocuments({ employee: employee._id, status: { $in: ACTIVE_TASK_STATUSES } });
  if (activeTasks) throw new HttpError(400, 'This employee still has active tasks. Complete or cancel them before deleting the employee.');
  await Task.updateMany({ employee: employee._id }, { $set: { employee: null, employeeSnapshot: { name: employee.name, email: employee.email } } });
  await employee.deleteOne();
  res.status(204).end();
}

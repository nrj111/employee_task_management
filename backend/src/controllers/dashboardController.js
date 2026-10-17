import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import { ACTIVE_TASK_STATUSES, TASK_STATUSES } from '../constants/workforce.js';

export async function getDashboard(_req, res) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [employees, statuses, overdue, workload, recentTasks] = await Promise.all([
    Employee.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.countDocuments({ dueDate: { $lt: today }, status: { $nin: ['Completed', 'Cancelled'] } }),
    Task.aggregate([{ $match: { status: { $in: ACTIVE_TASK_STATUSES } } }, { $group: { _id: '$employee', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 6 }, { $lookup: { from: 'employees', localField: '_id', foreignField: '_id', as: 'person' } }, { $unwind: { path: '$person', preserveNullAndEmptyArrays: true } }, { $project: { _id: 1, count: 1, name: { $ifNull: ['$person.name', 'Former employee'] }, department: '$person.department' } }]),
    Task.find().populate('employee', 'name').sort({ createdAt: -1 }).limit(6).lean()
  ]);
  const employeeCounts = Object.fromEntries(employees.map(x => [x._id, x.count]));
  const taskCounts = Object.fromEntries(TASK_STATUSES.map(s => [s, 0]));
  statuses.forEach(x => taskCounts[x._id] = x.count);
  res.json({ employees: { total: Object.values(employeeCounts).reduce((a,b) => a+b, 0), active: employeeCounts.Active || 0, inactive: employeeCounts.Inactive || 0, onLeave: employeeCounts['On Leave'] || 0 }, tasks: { total: Object.values(taskCounts).reduce((a,b) => a+b, 0), ...taskCounts, overdue }, workload, recentTasks });
}

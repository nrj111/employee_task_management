import mongoose from 'mongoose';
import { DEPARTMENTS, PRIORITIES, TASK_STATUSES } from '../constants/workforce.js';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 3000, default: '' },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null, index: true },
  employeeSnapshot: { name: { type: String, default: '' }, email: { type: String, default: '' } },
  department: { type: String, required: true, enum: DEPARTMENTS },
  priority: { type: String, enum: PRIORITIES, default: 'Medium' },
  status: { type: String, enum: TASK_STATUSES, default: 'Todo' },
  startDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  completedDate: { type: Date, default: null }
}, { timestamps: true });

taskSchema.index({ title: 'text' });
taskSchema.index({ status: 1, priority: 1, dueDate: 1 });
export default mongoose.model('Task', taskSchema);

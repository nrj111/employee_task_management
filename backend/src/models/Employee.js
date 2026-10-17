import mongoose from 'mongoose';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../constants/workforce.js';

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  department: { type: String, required: true, enum: DEPARTMENTS },
  role: { type: String, required: true, trim: true, maxlength: 100 },
  joiningDate: { type: Date, required: true },
  status: { type: String, enum: EMPLOYEE_STATUSES, default: 'Active' },
  skills: { type: [String], default: [] },
  leaveStart: { type: Date, default: null },
  leaveEnd: { type: Date, default: null }
}, { timestamps: true });

employeeSchema.index({ name: 1 });
export default mongoose.model('Employee', employeeSchema);

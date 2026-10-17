import { Router } from 'express';
import { createEmployee, deleteEmployee, getEmployee, listEmployees, updateEmployee } from '../controllers/employeeController.js';

const router = Router();
router.route('/').get(listEmployees).post(createEmployee);
router.route('/:id').get(getEmployee).put(updateEmployee).delete(deleteEmployee);
export default router;

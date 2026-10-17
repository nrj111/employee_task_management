import { Router } from 'express';
import { createTask, deleteTask, exportTasks, getTask, listTasks, updateTask, updateTaskStatus } from '../controllers/taskController.js';

const router = Router();
router.get('/export', exportTasks);
router.route('/').get(listTasks).post(createTask);
router.patch('/:id/status', updateTaskStatus);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
export default router;

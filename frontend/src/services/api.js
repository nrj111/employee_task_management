import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
export const getErrorMessage = error => error.response?.data?.message || error.message || 'Something went wrong.';
export const employeesApi = {
  list: params => api.get('/employees', { params }).then(r => r.data),
  get: id => api.get(`/employees/${id}`).then(r => r.data),
  create: body => api.post('/employees', body).then(r => r.data),
  update: (id, body) => api.put(`/employees/${id}`, body).then(r => r.data),
  remove: id => api.delete(`/employees/${id}`)
};
export const tasksApi = {
  list: params => api.get('/tasks', { params }).then(r => r.data),
  get: id => api.get(`/tasks/${id}`).then(r => r.data),
  create: body => api.post('/tasks', body).then(r => r.data),
  update: (id, body) => api.put(`/tasks/${id}`, body).then(r => r.data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }).then(r => r.data),
  remove: id => api.delete(`/tasks/${id}`),
  exportUrl: params => `${api.defaults.baseURL}/tasks/export?${new URLSearchParams(params)}`
};
export const dashboardApi = () => api.get('/dashboard').then(r => r.data);
export const apiOptions = { departments: ['Development', 'Design', 'QA', 'HR', 'Sales'], priorities: ['Low', 'Medium', 'High', 'Critical'], employeeStatuses: ['Active', 'Inactive', 'On Leave'], taskStatuses: ['Todo', 'In Progress', 'Completed', 'Cancelled'] };

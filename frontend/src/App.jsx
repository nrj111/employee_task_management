import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EmployeesPage from './pages/EmployeesPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import RecordFormPage from './pages/RecordFormPage.jsx';
import RecordDetailPage from './pages/RecordDetailPage.jsx';

export default function App() {
  return <ToastProvider><Routes><Route element={<AppLayout/>}><Route index element={<DashboardPage/>}/><Route path="employees" element={<EmployeesPage/>}/><Route path="employees/new" element={<RecordFormPage kind="employee"/>}/><Route path="employees/:id" element={<RecordDetailPage kind="employee"/>}/><Route path="employees/:id/edit" element={<RecordFormPage kind="employee"/>}/><Route path="tasks" element={<TasksPage/>}/><Route path="tasks/new" element={<RecordFormPage kind="task"/>}/><Route path="tasks/:id" element={<RecordDetailPage kind="task"/>}/><Route path="tasks/:id/edit" element={<RecordFormPage kind="task"/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes></ToastProvider>;
}

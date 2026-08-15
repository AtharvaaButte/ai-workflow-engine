
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthProvider';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPage from '../pages/dashboard/DashboardPage';
import WorkflowListPage from '../pages/workflows/WorkflowListPage';
import WorkflowDetailPage from '../pages/workflows/WorkflowDetailPage';
import WorkflowFormPage from '../pages/workflows/WorkflowFormPage';
import ExecutionListPage from '../pages/executions/ExecutionListPage';
import ExecutionDetailPage from '../pages/executions/ExecutionDetailPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="workflows" element={<WorkflowListPage />} />
              <Route path="workflows/new" element={<WorkflowFormPage />} />
              <Route path="workflows/:id" element={<WorkflowDetailPage />} />
              <Route path="workflows/:id/edit" element={<WorkflowFormPage />} />
              <Route path="executions" element={<ExecutionListPage />} />
              <Route path="executions/:id" element={<ExecutionDetailPage />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default AppRoutes;
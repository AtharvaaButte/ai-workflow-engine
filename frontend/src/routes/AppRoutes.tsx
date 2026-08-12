
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPage from '../pages/dashboard/DashboardPage';
import WorkflowListPage from '../pages/workflows/WorkflowListPage';
import WorkflowDetailPage from '../pages/workflows/WorkflowDetailPage';
import NotFoundPage from '../pages/NotFoundPage';
import ExecutionListPage from '../pages/executions/ExecutionListPage';
import SettingsPage from '../pages/settings/SettingsPage';
import WorkflowFormPage from '../pages/workflows/WorkflowFormPage';
import ExecutionDetailPage from '../pages/executions/ExecutionDetailPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
     <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Workflow Routes */}
        <Route path="workflows" element={<WorkflowListPage />} />
        <Route path="workflows/new" element={<WorkflowFormPage />} />
        <Route path="workflows/:id" element={<WorkflowDetailPage />} />
        <Route path="workflows/:id/edit" element={<WorkflowFormPage />} />

        {/* Execution & Settings Routes */}
        <Route path="executions" element={<ExecutionListPage />} />
        <Route path="settings" element={<SettingsPage />} />

        <Route path="executions" element={<ExecutionListPage />} />
        <Route path="executions/:id" element={<ExecutionDetailPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
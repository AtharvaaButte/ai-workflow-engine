import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { DashboardLayout } from '../layouts/DashboardLayout';

import DashboardPage from '../pages/dashboard/dashboardPage';
import WorkflowListPage from '../pages/workflows/WorkflowListPage';
import WorkflowDetailPage from '../pages/workflows/WorkflowDetailPage';
import CreateWorkflowPage from '../pages/workflows/CreateWorkflowPage';
import EditWorkflowPage from '../pages/workflows/EditWorkflowPage';
import ExecutionListPage from '../pages/executions/ExecutionListPage';
import ExecutionDetailPage from '../pages/executions/ExecutionDetailPage';
import SettingsPage from '../pages/settings/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* All pages inside DashboardLayout share the same Header & Sidebar */}
      <Route element={<DashboardLayout />}>
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        
        {/* Workflow Routes */}
        <Route path={ROUTES.WORKFLOWS.LIST} element={<WorkflowListPage />} />
        <Route path={ROUTES.WORKFLOWS.CREATE} element={<CreateWorkflowPage />} />
        <Route path={ROUTES.WORKFLOWS.DETAILS()} element={<WorkflowDetailPage />} />
        <Route path={ROUTES.WORKFLOWS.EDIT()} element={<EditWorkflowPage />} />
        
        {/* Execution Routes */}
        <Route path={ROUTES.EXECUTIONS.LIST} element={<ExecutionListPage />} />
        <Route path={ROUTES.EXECUTIONS.DETAILS()} element={<ExecutionDetailPage />} />
        
        {/* System Routes */}
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
      </Route>

      {/* Standalone Route (Outside Dashboard Layout) */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  );
};
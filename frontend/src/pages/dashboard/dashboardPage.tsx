
import  { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import type { Workflow } from '../../types/workflow';
import type { Execution } from '../../types';
import { workflowService } from '../../services/workflowService';
import executionService from '../../services/executionService';
export default function DashboardPage() {
  const navigate = useNavigate();

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardStats = async () => {
      setIsLoading(true);
      try {
        const [wfData, execData] = await Promise.all([
          workflowService.getAll().catch(() => []),
          executionService.getAll().catch(() => []),
        ]);

        if (isMounted) {
          setWorkflows(wfData);
          setExecutions(execData);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalWorkflows = workflows.length;
  const totalExecutions = executions.length;
  const successfulExecutions = executions.filter(
    (e) => e.status === 'SUCCESS' || e.status === 'COMPLETED'
  ).length;
  
  const successRate = totalExecutions > 0 
    ? Math.round((successfulExecutions / totalExecutions) * 100) 
    : 100;

  if (isLoading) {
    return (
      <PageContainer title="Dashboard Overview">
        <Loader label="Calculating metrics from database..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Dashboard Overview"
      description="Real-time system statistics and automated pipeline metrics."
      actions={
        <Button variant="primary" onClick={() => navigate('/workflows/new')}>
          + Create Workflow
        </Button>
      }
    >
      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>Total Workflows</span>
          <h2 style={{ fontSize: '2rem', margin: '0.25rem 0 0 0', color: 'var(--primary, #3b82f6)' }}>
            {totalWorkflows}
          </h2>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>Total Executions</span>
          <h2 style={{ fontSize: '2rem', margin: '0.25rem 0 0 0', color: '#10b981' }}>
            {totalExecutions}
          </h2>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>Success Rate</span>
          <h2 style={{ fontSize: '2rem', margin: '0.25rem 0 0 0', color: successRate >= 90 ? '#10b981' : '#f59e0b' }}>
            {successRate}%
          </h2>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Quick Management</h3>
        <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.9rem' }}>
          Navigate quickly to manage workflows or monitor step execution runtimes.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <Button variant="secondary" onClick={() => navigate('/workflows')}>
            Manage Workflows
          </Button>
          <Button variant="secondary" onClick={() => navigate('/executions')}>
            View Execution Logs
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

import  { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';
import { Table, type Column } from '../../components/ui/Table';
import { Loader } from '../../components/ui/Loader';
import { useWorkflows } from '../../hooks/useWorkflows';
import type { Workflow } from '../../types/workflow';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { workflows, isLoading, fetchWorkflows } = useWorkflows();

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  // Summary Metrics (Will map to GET /api/v1/dashboard in Phase 6)
  const stats = [
    { label: 'Total Workflows', value: workflows.length || 0, color: 'var(--primary, #3b82f6)' },
    { label: 'Active Workflows', value: workflows.filter((w) => w.metadata?.status === 'ACTIVE').length || 0, color: '#10b981' },
    { label: 'Total Executions', value: 142, color: '#8b5cf6' },
    { label: 'Failed Executions', value: 3, color: '#ef4444' },
  ];

  const recentColumns: Column<Workflow>[] = [
    {
      header: 'Name',
      key: 'id',
      render: (w) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {w.metadata?.name || 'Unnamed Workflow'}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'id',
      render: (w) => (
        <span className={`status-badge status-${(w.metadata?.status || 'DRAFT').toLowerCase()}`}>
          {w.metadata?.status || 'DRAFT'}
        </span>
      ),
    },
    {
      header: 'Nodes',
      key: 'id',
      render: (w) => `${w.nodes?.length || 0} nodes`,
    },
    {
      header: 'Actions',
      key: 'id',
      render: (w) => (
        <Button variant="secondary" size="sm" onClick={() => navigate(`/workflows/${w.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      title="Dashboard"
      description="System overview and workflow runtime execution metrics."
      actions={
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => navigate('/workflows')}>
            View All Workflows
          </Button>

          <Button variant="primary" onClick={() => navigate('/workflows/new')}>
            + Create Workflow
          </Button>
        </div>
      }
    >
      {/* 1. Summary Cards Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              padding: '1.25rem',
              borderRadius: '8px',
              borderLeft: `4px solid ${stat.color}`,
            }}
          >
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted, #9ca3af)' }}>
              {stat.label}
            </p>
            <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700 }}>
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      {/* 2. Recent Workflows Table Section */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Recent Workflows</h3>
        {isLoading ? (
          <Loader label="Loading recent workflows..." />
        ) : (
          <Table columns={recentColumns} data={workflows.slice(0, 5)} />
        )}
      </div>
    </PageContainer>
  );
}
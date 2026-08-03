
import { useEffect } from 'react';
import { useWorkflows } from '../../hooks/useWorkflows';
import { PageContainer } from '../../components/layout/PageContainer';
import { Table, type Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Workflow } from '../../types/workflow';

export default function WorkflowListPage() {
  const { workflows, isLoading, error, fetchWorkflows, deleteWorkflow } = useWorkflows();

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const columns: Column<Workflow>[] = [
    { header: 'ID', key: 'id' },
    { header: 'Name', key: 'metadata', render: (w) => w.metadata.name },
    { header: 'Description', key: 'metadata', render: (w) => w.metadata.description },
    { header: 'Status', key: 'metadata', render: (w) => w.metadata.status || 'DRAFT' },
    {
      header: 'Actions',
      key: 'id',
      render: (w) => (
        <Button variant="danger" size="sm" onClick={() => deleteWorkflow(w.id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      title="Workflows"
      description="Manage and monitor your automated AI pipelines."
      actions={<Button variant="primary">+ Create Workflow</Button>}
    >
      {isLoading ? (
        <Loader label="Fetching workflows from backend..." />
      ) : error ? (
        <div className="card" style={{ color: 'var(--danger)', textAlign: 'center' }}>
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchWorkflows} style={{ marginTop: '0.5rem' }}>
            Retry Connection
          </Button>
        </div>
      ) : !workflows || workflows.length === 0 ? (
        <EmptyState
          title="No Workflows Found"
          description="Create your first AI workflow to begin automation."
          actionLabel="Create Workflow"
          onAction={() => console.log('Navigate to create page')}
        />
      ) : (
        <Table columns={columns} data={workflows} />
      )}
    </PageContainer>
  );
}

import  { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Table, type Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { useWorkflows } from '../../hooks/useWorkflows';
import type { Workflow } from '../../types/workflow';

export default function WorkflowListPage() {
  const navigate = useNavigate();
  const { workflows, isLoading, error, fetchWorkflows, deleteWorkflow } = useWorkflows();

  // State for deletion modal
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleDeleteConfirm = async () => {
    if (!workflowToDelete) return;
    setIsDeleting(true);
    const success = await deleteWorkflow(workflowToDelete.id);
    setIsDeleting(false);
    if (success) {
      setWorkflowToDelete(null);
    }
  };

  const columns: Column<Workflow>[] = [
    {
      header: 'ID',
      key: 'id',
      render: (w) => <code style={{ fontSize: '0.8rem' }}>{w.id.substring(0, 8)}...</code>,
    },
    {
      header: 'Name',
      key: 'id',
      render: (w) => <strong>{w.metadata?.name || 'Unnamed Workflow'}</strong>,
    },
    {
      header: 'Description',
      key: 'id',
      render: (w) => w.metadata?.description || '-',
    },
    {
      header: 'Nodes',
      key: 'id',
      render: (w) => `${w.nodes?.length || 0} nodes`,
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
      header: 'Actions',
      key: 'id',
      render: (w) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/workflows/${w.id}`)}>
            View
          </Button>

          <Button variant="secondary" size="sm" onClick={() => navigate(`/workflows/${w.id}/edit`)}>
            Edit
          </Button>

          <Button variant="danger" size="sm" onClick={() => setWorkflowToDelete(w)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Workflows"
      description="Manage and monitor your automated AI pipelines."
      actions={
        <Button variant="primary" onClick={() => navigate('/workflows/new')}>
          + Create Workflow
        </Button>
      }
    >
      {isLoading ? (
        <Loader label="Fetching workflows from Spring Boot..." />
      ) : error ? (
        <div className="card" style={{ color: 'var(--danger)', textAlign: 'center', padding: '2rem' }}>
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchWorkflows}>
            Retry Connection
          </Button>
        </div>
      ) : !workflows || workflows.length === 0 ? (
        <EmptyState
          title="No Workflows Found"
          description="Create your first AI workflow pipeline to begin."
          actionLabel="Create Workflow"
          onAction={() => navigate('/workflows/new')}
        />
      ) : (
        <Table columns={columns} data={workflows} />
      )}

      {/* Confirmation Modal for Deletion */}
      <Modal
        isOpen={Boolean(workflowToDelete)}
        title="Confirm Deletion"
        onClose={() => setWorkflowToDelete(null)}
        onConfirm={handleDeleteConfirm}
        confirmLabel="Delete Workflow"
        confirmVariant="danger"
        isConfirming={isDeleting}
      >
        <p style={{ margin: 0 }}>
          Are you sure you want to delete workflow{' '}
          <strong>"{workflowToDelete?.metadata?.name || workflowToDelete?.id}"</strong>?
        </p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          This action cannot be undone.
        </p>
      </Modal>
    </PageContainer>
  );
}
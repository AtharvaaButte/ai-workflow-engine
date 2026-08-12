// src/pages/workflows/WorkflowListPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Table, type Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { ExecuteWorkflowModal } from '../../components/workflow/ExecuteWorkflowModal';
import { useWorkflows } from '../../hooks/useWorkflows';
import type { Workflow } from '../../types/workflow';

export default function WorkflowListPage() {
  const navigate = useNavigate();
  const { workflows, isLoading, error, fetchWorkflows, deleteWorkflow } = useWorkflows();

  // Modals state
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null);
  const [workflowToExecute, setWorkflowToExecute] = useState<Workflow | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleDeleteConfirm = async () => {
    if (!workflowToDelete) return;
    setIsDeleting(true);
    const success = await deleteWorkflow(workflowToDelete.id);
    setIsDeleting(false);
    if (success) setWorkflowToDelete(null);
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
      header: 'Version',
      key: 'id',
      render: (w) => <span>v{w.metadata?.version || 1}</span>,
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
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Button variant="primary" size="sm" onClick={() => setWorkflowToExecute(w)}>
            ▶ Run
          </Button>
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
      description="Manage and execute your automated AI pipelines."
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

      {/* Execute Modal */}
      {workflowToExecute && (
        <ExecuteWorkflowModal
          isOpen={Boolean(workflowToExecute)}
          workflowId={workflowToExecute.id}
          workflowName={workflowToExecute.metadata?.name || workflowToExecute.id}
          onClose={() => setWorkflowToExecute(null)}
          onSuccess={(executionId) => {
            navigate(`/executions/${executionId}`);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
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
      </Modal>
    </PageContainer>
  );
}
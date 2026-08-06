
import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { workflowService } from '../../services/workflowService';
import { useToast } from '../../hooks/useToast';
import type { Workflow } from '../../types/workflow';

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchWorkflow = async () => {
      setIsLoading(true);
      try {
        const data = await workflowService.getById(id);
        if (isMounted) {
          setWorkflow(data);
        }
      } catch {
        if (isMounted) {
          addToast('error', 'Failed to load workflow details.');
          navigate('/workflows');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWorkflow();

    return () => {
      isMounted = false;
    };
  }, [id, navigate, addToast]);

  if (isLoading) {
    return (
      <PageContainer title="Workflow Details">
        <Loader label="Loading workflow specification..." />
      </PageContainer>
    );
  }

  if (!workflow) return null;

  return (
    <PageContainer
      title={workflow.metadata?.name || 'Workflow Detail'}
      description={`ID: ${workflow.id}`}
      actions={
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => navigate('/workflows')}>
            Back to Workflows
          </Button>

          <Button variant="primary" onClick={() => navigate(`/workflows/${workflow.id}/edit`)}>
            Edit Workflow
          </Button>
        </div>
      }
    >
      {/* 1. Metadata Info Grid */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Configuration Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Description</span>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 500 }}>{workflow.metadata?.description || '-'}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Version</span>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 500 }}>v{workflow.metadata?.version || 1}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status</span>
            <p style={{ margin: '0.25rem 0 0 0' }}>
              <span className={`status-badge status-${(workflow.metadata?.status || 'DRAFT').toLowerCase()}`}>
                {workflow.metadata?.status || 'DRAFT'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Nodes Summary */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Pipeline Nodes ({workflow.nodes?.length || 0})</h3>
        {(!workflow.nodes || workflow.nodes.length === 0) ? (
          <p style={{ color: 'var(--text-muted)' }}>No nodes configured in this pipeline.</p>
        ) : (
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            {workflow.nodes.map((node) => (
              <li key={node.id} style={{ marginBottom: '0.5rem' }}>
                <strong>{node.id}</strong> — <code style={{ color: 'var(--primary)' }}>{node.type}</code>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 3. Edges Summary */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Graph Connections ({workflow.edges?.length || 0})</h3>
        {(!workflow.edges || workflow.edges.length === 0) ? (
          <p style={{ color: 'var(--text-muted)' }}>No node connections configured.</p>
        ) : (
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            {workflow.edges.map((edge, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>
                <code>{edge.source}</code> &rarr; <code>{edge.target}</code>
                {edge.condition && (
                  <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                    (Condition: {edge.condition})
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageContainer>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { executionService, type ExecutionDetailResponse } from '../../services/executionService';
import { useToast } from '../../hooks/useToast';

export default function ExecutionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [execution, setExecution] = useState<ExecutionDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadExecutionDetails = useCallback(
    async (isInitial = false) => {
      if (!id) return;

      if (isInitial) {
        setIsLoading(true);
      }

      try {
        const data = await executionService.getById(id);
        setExecution(data);
      } catch {
        if (isInitial) {
          addToast('error', 'Failed to load execution step logs.');
        }
      } finally {
        if (isInitial) {
          setIsLoading(false);
        }
      }
    },
    [id, addToast]
  );

  useEffect(() => {
    let isMounted = true;

    const initLoad = async () => {
      if (!id) return;
      try {
        const data = await executionService.getById(id);
        if (isMounted) {
          setExecution(data);
        }
      } catch {
        if (isMounted) {
          addToast('error', 'Failed to load execution step logs.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initLoad();

    // Auto-poll every 3 seconds if status is RUNNING or PENDING
    const interval = setInterval(() => {
      if (execution?.status === 'RUNNING' || execution?.status === 'PENDING') {
        loadExecutionDetails(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id, execution?.status, loadExecutionDetails, addToast]);

  if (isLoading) {
    return (
      <PageContainer title="Execution Step Logs">
        <Loader label="Fetching node execution step logs..." />
      </PageContainer>
    );
  }

  if (!execution) {
    return (
      <PageContainer title="Execution Not Found">
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Execution log with ID "{id}" could not be retrieved.</p>
          <Button variant="secondary" onClick={() => navigate('/executions')}>
            Back to Executions
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Execution Log: ${execution.id.substring(0, 8)}...`}
      description={`Workflow: ${execution.workflowName || execution.workflowId}`}
      actions={
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" size="sm" onClick={() => loadExecutionDetails(true)}>
            🔄 Refresh Logs
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/executions')}>
            Back to Executions
          </Button>
        </div>
      }
    >
      {/* 1. Execution Overview Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Run Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.85rem' }}>Status</span>
            <p style={{ margin: '0.25rem 0 0 0' }}>
              <span className={`status-badge status-${execution.status.toLowerCase()}`}>
                {execution.status}
              </span>
            </p>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.85rem' }}>Total Runtime</span>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
              {typeof execution.durationMs === 'number' && execution.durationMs >= 0
                ? `${execution.durationMs} ms`
                : execution.status === 'RUNNING'
                ? 'Running...'
                : '-'}
            </p>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.85rem' }}>Started At</span>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 500, color: 'var(--text-main, #0f172a)' }}>
              {execution.startedAt ? new Date(execution.startedAt).toLocaleString() : '-'}
            </p>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.85rem' }}>Completed At</span>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 500, color: 'var(--text-main, #0f172a)' }}>
              {execution.completedAt ? new Date(execution.completedAt).toLocaleString() : '-'}
            </p>
          </div>
        </div>

        {execution.errorMessage && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px' }}>
            <strong style={{ color: '#dc2626' }}>Execution Error:</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#991b1b' }}>{execution.errorMessage}</p>
          </div>
        )}
      </div>

      {/* 2. Step Logs Breakdown */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-main, #0f172a)' }}>
          Node-by-Node Execution Step Logs
        </h3>

        {!execution.nodeLogs || execution.nodeLogs.length === 0 ? (
          <p style={{ color: 'var(--text-muted, #64748b)', margin: 0 }}>No individual step logs recorded for this execution.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {execution.nodeLogs.map((step, idx) => (
              <div
                key={step.id || idx}
                style={{
                  padding: '1rem',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary, #f8fafc)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main, #0f172a)' }}>
                      Step {idx + 1}: {step.nodeId}
                    </strong>
                    <code
                      style={{
                        fontSize: '0.75rem',
                        background: '#e2e8f0',
                        color: '#334155',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}
                    >
                      {step.nodeType}
                    </code>
                    <span className={`status-badge status-${step.status.toLowerCase()}`}>
                      {step.status}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>
                    Runtime: <strong style={{ color: '#2563eb' }}>{step.durationMs} ms</strong>
                  </span>
                </div>

                {step.executedAt && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
                    Executed At: {new Date(step.executedAt).toLocaleString()}
                  </div>
                )}

                {step.errorMessage && (
                  <div style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: '0.85rem' }}>
                    <strong>Error:</strong> {step.errorMessage}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
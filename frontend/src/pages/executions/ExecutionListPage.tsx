
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Table, type Column } from '../../components/ui/Table';
import { Loader } from '../../components/ui/Loader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { useExecutions } from '../../hooks/useExecutions';
import type { Execution } from '../../types/execution';

export default function ExecutionListPage() {
  const navigate = useNavigate();
  const { executions, isLoading, error, fetchExecutions } = useExecutions();

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  // Helper to format execution duration nicely
  const formatExecutionTime = (execution: Execution): string => {
    if (typeof execution.durationMs === 'number' && execution.durationMs >= 0) {
      return `${execution.durationMs} ms`;
    }

    if (execution.startedAt && execution.completedAt) {
      const start = new Date(execution.startedAt).getTime();
      const end = new Date(execution.completedAt).getTime();
      const diff = end - start;
      if (!isNaN(diff) && diff >= 0) {
        return `${diff} ms`;
      }
    }

    return execution.status === 'RUNNING' || execution.status === 'PENDING' ? 'In Progress...' : '-';
  };

  const columns: Column<Execution>[] = [
    {
      header: 'Execution ID',
      key: 'id',
      render: (e) => <code style={{ fontSize: '0.8rem' }}>{e.id.substring(0, 8)}...</code>,
    },
    {
      header: 'Workflow ID',
      key: 'workflowId',
      render: (e) => <code style={{ fontSize: '0.8rem' }}>{e.workflowId.substring(0, 8)}...</code>,
    },
    {
      header: 'Status',
      key: 'status',
      render: (e) => (
        <span className={`status-badge status-${e.status.toLowerCase()}`}>
          {e.status}
        </span>
      ),
    },
    {
      header: 'Started At',
      key: 'startedAt',
      render: (e) => (e.startedAt ? new Date(e.startedAt).toLocaleString() : '-'),
    },
    {
      header: 'Execution Time',
      key: 'durationMs',
      render: (e) => <strong>{formatExecutionTime(e)}</strong>,
    },
    {
      header: 'Actions',
      key: 'id',
      render: (e) => (
        <Button variant="secondary" size="sm" onClick={() => navigate(`/executions/${e.id}`)}>
          Inspect Logs
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      title="Executions"
      description="Monitor execution history, step runtimes, and active workflow runs."
      actions={
        <Button variant="secondary" size="sm" onClick={fetchExecutions}>
          Refresh History
        </Button>
      }
    >
      {isLoading ? (
        <Loader label="Fetching execution logs from Spring Boot..." />
      ) : error ? (
        <div className="card" style={{ color: 'var(--danger)', textAlign: 'center', padding: '2rem' }}>
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchExecutions}>
            Retry
          </Button>
        </div>
      ) : !executions || executions.length === 0 ? (
        <EmptyState title="No Executions Found" description="Trigger a workflow execution to see history here." />
      ) : (
        <Table columns={columns} data={executions} />
      )}
    </PageContainer>
  );
}
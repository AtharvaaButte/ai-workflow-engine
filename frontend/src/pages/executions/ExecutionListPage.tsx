
import { useEffect } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Table, type Column } from '../../components/ui/Table';
import { Loader } from '../../components/ui/Loader';
import { EmptyState } from '../../components/ui/EmptyState';
import { useExecutions } from '../../hooks/useExecutions';
import type { Execution } from '../../types/execution';

export default function ExecutionListPage() {
  const { executions, isLoading, error, fetchExecutions } = useExecutions();

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  const columns: Column<Execution>[] = [
    {
      header: 'Execution ID',
      key: 'id',
      render: (e) => <code>{e.id.substring(0, 8)}...</code>,
    },
    {
      header: 'Workflow ID',
      key: 'workflowId',
      render: (e) => <code>{e.workflowId.substring(0, 8)}...</code>,
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
      render: (e) => new Date(e.startedAt).toLocaleString(),
    },
    {
      header: 'Execution Time',
      key: 'executionTimeMs',
      render: (e) => (e.executionTimeMs ? `${e.executionTimeMs} ms` : '-'),
    },
  ];

  return (
    <PageContainer title="Executions" description="Monitor execution history and active runs.">
      {isLoading ? (
        <Loader label="Fetching execution logs..." />
      ) : error ? (
        <div className="card" style={{ color: 'var(--danger)', textAlign: 'center', padding: '2rem' }}>
          <p>{error}</p>
        </div>
      ) : !executions || executions.length === 0 ? (
        <EmptyState title="No Executions Found" description="Trigger a workflow execution to see history here." />
      ) : (
        <Table columns={columns} data={executions} />
      )}
    </PageContainer>
  );
}
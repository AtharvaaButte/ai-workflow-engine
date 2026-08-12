export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'SUCCESS' | 'FAILED';

export interface Execution {
  id: string;
  workflowId: string;
  workflowName?: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string | null;
  durationMs?: number | null;
  errorMessage?: string | null;
}
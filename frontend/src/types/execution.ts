
export interface StepLog {
  nodeId: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  output?: Record<string, unknown>;
  error?: string;
}

export interface Execution {
  id: string;
  workflowId: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'COMPLETED';
  context?: Record<string, unknown>;
  stepLogs?: StepLog[];
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  createdAt?: string;
}

export interface ExecutionRequest {
  inputs?: Record<string, unknown>;
  [key: string]: unknown;
}
export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export type ExecutionRequest = Record<string, unknown>;

export interface Execution {
  id: string;
  workflowId: string;
  workflowName?: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  executionTimeMs?: number;
  inputs: ExecutionRequest;
  outputs?: Record<string, unknown>; 
  errorMessage?: string;
  logs?: string[];
}
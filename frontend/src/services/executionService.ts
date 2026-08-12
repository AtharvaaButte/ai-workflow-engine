
import api from '../api/axios';
import type { Execution } from '../types/execution';

export interface NodeExecutionLogResponse {
  id: string;
  nodeId: string;
  nodeType: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'SUCCESS' | 'FAILED';
  errorMessage?: string | null;
  durationMs: number;
  executedAt: string;
}

export interface ExecutionDetailResponse {
  id: string;
  workflowId: string;
  workflowName?: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'SUCCESS' | 'FAILED';
  startedAt: string;
  completedAt?: string | null;
  durationMs?: number | null;
  errorMessage?: string | null;
  nodeLogs?: NodeExecutionLogResponse[];
}

export const executionService = {
  /**
   * Triggers a live execution of a workflow.
   * Endpoint: POST /api/v1/workflows/{id}/execute
   */
  executeWorkflow: async (workflowId: string, inputPayload: Record<string, unknown> = {}): Promise<Execution> => {
    const response = await api.post<Execution>(`/workflows/${workflowId}/execute`, inputPayload);
    return response.data;
  },

  /**
   * Fetches all execution history records across all workflows.
   * Endpoint: GET /api/v1/executions
   */
  getAll: async (): Promise<Execution[]> => {
    const response = await api.get<Execution[]>('/executions');
    return response.data;
  },

  /**
   * Fetches step logs and execution response for a specific execution run.
   * Endpoint: GET /api/v1/executions/{executionId}
   */
  getById: async (executionId: string): Promise<ExecutionDetailResponse> => {
    const response = await api.get<ExecutionDetailResponse>(`/executions/${executionId}`);
    return response.data;
  },
};

export default executionService;
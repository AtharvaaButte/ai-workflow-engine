
import api from '../api/axios';
import type { ApiResponse } from '../types/api';
import type {
  Workflow,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
} from '../types/workflow';
import type { Execution, ExecutionRequest } from '../types/execution';

export const workflowService = {
  /**
   * GET /api/v1/workflows
   */
  async getAll(): Promise<Workflow[]> {
    const response = await api.get<ApiResponse<Workflow[]>>('/workflows');
    return response.data.data;
  },

  /**
   * GET /api/v1/workflows/{id}
   */
  async getById(id: string): Promise<Workflow> {
    const response = await api.get<ApiResponse<Workflow>>(`/workflows/${id}`);
    return response.data.data;
  },

  /**
   * POST /api/v1/workflows
   */
  async create(payload: CreateWorkflowRequest): Promise<Workflow> {
    const response = await api.post<ApiResponse<Workflow>>('/workflows', payload);
    return response.data.data;
  },

  /**
   * PUT /api/v1/workflows/{id}
   */
  async update(id: string, payload: UpdateWorkflowRequest): Promise<Workflow> {
    const response = await api.put<ApiResponse<Workflow>>(`/workflows/${id}`, payload);
    return response.data.data;
  },

  /**
   * DELETE /api/v1/workflows/{id}
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/workflows/${id}`);
  },

  /**
   * POST /api/v1/workflows/{id}/execute
   */
  async execute(id: string, inputs: ExecutionRequest): Promise<Execution> {
    const response = await api.post<ApiResponse<Execution>>(`/workflows/${id}/execute`, inputs);
    return response.data.data;
  },
};
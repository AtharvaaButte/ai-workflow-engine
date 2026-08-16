
import api from '../api/axios';
import type { Workflow, CreateWorkflowRequest, UpdateWorkflowRequest } from '../types/workflow';
import type { Execution, ExecutionRequest } from '../types/execution';

export const workflowService = {
  /**
   * GET /api/v1/workflows
   */
  async getAll(): Promise<Workflow[]> {
    const response = await api.get<Workflow[]>('/workflows');
    return response.data; 
  },

  /**
   * GET /api/v1/workflows/{id}
   */
  async getById(id: string): Promise<Workflow> {
    const response = await api.get<Workflow>(`/workflows/${id}`);
    return response.data;
  },

  /**
   * POST /api/v1/workflows
   */
  async create(payload: CreateWorkflowRequest): Promise<Workflow> {
    const response = await api.post<Workflow>('/workflows', payload);
    return response.data;
  },

  /**
   * PUT /api/v1/workflows/{id}
   */
  async update(id: string, payload: UpdateWorkflowRequest): Promise<Workflow> {
    const response = await api.put<Workflow>(`/workflows/${id}`, payload);
    return response.data;
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
    const response = await api.post<Execution>(`/workflows/${id}/execute`, inputs);
    return response.data;
  },
};
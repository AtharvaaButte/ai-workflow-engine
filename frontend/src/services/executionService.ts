// src/services/executionService.ts

import api from '../api/axios';
import type { ApiResponse } from '../types/api';
import type { Execution } from '../types/execution';

export const executionService = {
  /**
   * GET /api/v1/executions
   */
  async getAll(): Promise<Execution[]> {
    const response = await api.get<ApiResponse<Execution[]>>('/executions');
    return response.data.data;
  },

  /**
   * GET /api/v1/executions/{id}
   */
  async getById(id: string): Promise<Execution> {
    const response = await api.get<ApiResponse<Execution>>(`/executions/${id}`);
    return response.data.data;
  },
};
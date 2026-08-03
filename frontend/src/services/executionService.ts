// src/services/executionService.ts

import api from '../api/axios';
import type { Execution } from '../types/execution';

export const executionService = {
  /**
   * GET /api/v1/executions
   */
  async getAll(): Promise<Execution[]> {
    const response = await api.get<Execution[]>('/executions');
    return response.data; // Direct array access matching Postman contract
  },

  /**
   * GET /api/v1/executions/{id}
   */
  async getById(id: string): Promise<Execution> {
    const response = await api.get<Execution>(`/executions/${id}`);
    return response.data;
  },
};
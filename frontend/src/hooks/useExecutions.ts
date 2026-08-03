
import { useState, useCallback } from 'react';
import { executionService } from '../services/executionService';
import { useToast } from './useToast';
import type { Execution } from '../types/execution';
import type { ApiErrorResponse } from '../types/api';

export const useExecutions = () => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { addToast } = useToast();

  const fetchExecutions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await executionService.getAll();
      setExecutions(data);
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      const errorMsg = apiErr.message || 'Failed to fetch execution history.';
      setError(errorMsg);
      addToast('error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  return {
    executions,
    isLoading,
    error,
    fetchExecutions,
  };
};

import { useState, useCallback } from 'react';
import { executionService } from '../services/executionService';
import { useToast } from './useToast';
import type { Execution } from '../types/execution';
import type { ApiErrorResponse } from '../types/api';

export const useExecutions = () => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { addToast } = useToast();

  // Fetch all execution history logs
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

  // Trigger a new workflow execution
  const executeWorkflow = useCallback(
    async (workflowId: string, inputPayload: Record<string, unknown> = {}): Promise<Execution | null> => {
      setIsExecuting(true);
      try {
        const execution = await executionService.executeWorkflow(workflowId, inputPayload);
        addToast('success', `Workflow execution triggered successfully! (ID: ${execution.id.substring(0, 8)})`);
        
        // Optimistically prepend to active executions list
        setExecutions((prev) => [execution, ...prev]);
        return execution;
      } catch (err) {
        const apiErr = err as ApiErrorResponse;
        const errorMsg = apiErr.message || 'Failed to trigger workflow execution.';
        addToast('error', errorMsg);
        return null;
      } finally {
        setIsExecuting(false);
      }
    },
    [addToast]
  );

  return {
    executions,
    isLoading,
    isExecuting,
    error,
    fetchExecutions,
    executeWorkflow,
  };
};

export default useExecutions;
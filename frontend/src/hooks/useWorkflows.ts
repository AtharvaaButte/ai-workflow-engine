
import { useState, useCallback } from 'react';
import { workflowService } from '../services/workflowService';
import { useToast } from './useToast';
import type { Workflow, CreateWorkflowRequest } from '../types/workflow';
import type { ApiErrorResponse } from '../types/api';

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { addToast } = useToast();

  // Fetch all workflows from Spring Boot
  const fetchWorkflows = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await workflowService.getAll();
      console.log(data);
      
      setWorkflows(data);
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      const errorMsg = apiErr.message || 'Failed to fetch workflows.';
      setError(errorMsg);
      addToast('error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Create a new workflow
  const createWorkflow = async (payload: CreateWorkflowRequest): Promise<Workflow | null> => {
    setIsLoading(true);
    try {
      const created = await workflowService.create(payload);
      setWorkflows((prev) => [created, ...prev]);
      addToast('success', `Workflow "${created.metadata.name}" created successfully.`);
      return created;
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      addToast('error', apiErr.message || 'Failed to create workflow.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a workflow by ID
  const deleteWorkflow = async (id: string): Promise<boolean> => {
    try {
      await workflowService.delete(id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
      addToast('success', 'Workflow deleted successfully.');
      return true;
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      addToast('error', apiErr.message || 'Failed to delete workflow.');
      return false;
    }
  };

  return {
    workflows,
    isLoading,
    error,
    fetchWorkflows,
    createWorkflow,
    deleteWorkflow,
  };
};
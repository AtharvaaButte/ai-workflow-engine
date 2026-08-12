// src/pages/workflows/WorkflowFormPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { workflowService } from '../../services/workflowService';
import { useToast } from '../../hooks/useToast';
import type { CreateWorkflowRequest, WorkflowNode, WorkflowEdge } from '../../types/workflow';
import type { ApiErrorResponse } from '../../types/api';

// Default testing nodes attached to every request
const POSTMAN_TEST_NODES: WorkflowNode[] = [
  {
    id: "http_trigger_1",
    type: "http_trigger",
    config: {}
  },
  {
    id: "ai_processor_1",
    type: "ai_processor",
    config: {
      provider: "openai",
      inputKey: "customer_query",
      outputKey: "ticket_category",
      task: "classification",
      prompt: "Classify issue into billing or technical"
    }
  },
  {
    id: "condition_1",
    type: "condition",
    config: {
      field: "ticket_category"
    }
  },
  {
    id: "response_billing",
    type: "response",
    config: {
      responseKeys: "ticket_category, node_ai_status"
    }
  },
  {
    id: "response_technical",
    type: "response",
    config: {
      responseKeys: "ticket_category, node_ai_status"
    }
  }
];

const POSTMAN_TEST_EDGES: WorkflowEdge[] = [
  {
    source: "http_trigger_1",
    target: "ai_processor_1",
    condition: null
  },
  {
    source: "ai_processor_1",
    target: "condition_1",
    condition: null
  },
  {
    source: "condition_1",
    target: "response_billing",
    condition: "billing"
  },
  {
    source: "condition_1",
    target: "response_technical",
    condition: "else"
  }
];



export default function WorkflowFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [name, setName] = useState<string>('');
  const [version, setVersion] = useState<number>(1);
  const [description, setDescription] = useState<string>('');

  const [existingNodes, setExistingNodes] = useState<WorkflowNode[]>([]);
  const [existingEdges, setExistingEdges] = useState<WorkflowEdge[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch existing details if in Edit mode
  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchExisting = async () => {
      setIsLoading(true);
      try {
        const existing = await workflowService.getById(id);
        if (isMounted && existing) {
          setName(existing.metadata?.name || '');
          setVersion(existing.metadata?.version || 1);
          setDescription(existing.metadata?.description || '');
          setExistingNodes(existing.nodes || []);
          setExistingEdges(existing.edges || []);
        }
      } catch {
        if (isMounted) {
          addToast('error', 'Failed to load workflow for editing.');
          navigate('/workflows');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchExisting();

    return () => {
      isMounted = false;
    };
  }, [id, navigate, addToast]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) {
      errors.name = 'Workflow name is required.';
    }
    if (!description.trim()) {
      errors.description = 'Description is required.';
    }
    if (version < 1) {
      errors.version = 'Version must be 1 or greater.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setFieldErrors({});

    const payload: CreateWorkflowRequest = {
      metadata: {
        name: name.trim(),
        version: Number(version),
        description: description.trim(),
      },
      nodes: existingNodes.length > 0 ? existingNodes : POSTMAN_TEST_NODES,
      edges: existingEdges.length > 0 ? existingEdges : POSTMAN_TEST_EDGES,
    };

    try {
      if (isEditMode && id) {
        await workflowService.update(id, payload);
        addToast('success', `Workflow "${name}" updated successfully.`);
      } else {
        await workflowService.create(payload);
        addToast('success', `Workflow "${name}" created successfully! Default test nodes attached.`);
      }
      navigate('/workflows');
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      addToast('error', apiErr.message || 'Failed to save workflow.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer title={isEditMode ? 'Edit Workflow' : 'Create Workflow'}>
        <Loader label="Loading workflow specification..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={isEditMode ? 'Edit Workflow' : 'Create Workflow'}
      description="Specify workflow metadata. Standard testing pipeline nodes will automatically be attached."
    >
      <div className="card" style={{ maxWidth: '640px', padding: '1.5rem' }}>
        <form onSubmit={handleSubmit}>
          {/* Workflow Name */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
              Workflow Name <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Customer Support Router"
              disabled={isSubmitting}
              style={{ width: '100%' }}
            />
            {fieldErrors.name && (
              <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                {fieldErrors.name}
              </span>
            )}
          </div>

          {/* Version */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
              Version <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="number"
              min={1}
              className="input"
              value={version}
              onChange={(e) => setVersion(parseInt(e.target.value, 10) || 1)}
              disabled={isSubmitting}
              style={{ width: '100%' }}
            />
            {fieldErrors.version && (
              <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                {fieldErrors.version}
              </span>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
              Description <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              className="input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this workflow automates..."
              disabled={isSubmitting}
              style={{ width: '100%', resize: 'vertical' }}
            />
            {fieldErrors.description && (
              <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                {fieldErrors.description}
              </span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="secondary" onClick={() => navigate('/workflows')} disabled={isSubmitting}>
              Cancel
            </Button>

            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? 'Saving Changes...'
                  : 'Creating...'
                : isEditMode
                ? 'Save Changes'
                : 'Create Workflow'}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
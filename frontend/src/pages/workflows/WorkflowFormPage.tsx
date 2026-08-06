// src/pages/workflows/WorkflowFormPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { workflowService } from '../../services/workflowService';
import { useToast } from '../../hooks/useToast';
import type { WorkflowStatus, CreateWorkflowRequest } from '../../types/workflow';
import type { ApiErrorResponse } from '../../types/api';

export default function WorkflowFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<WorkflowStatus>('DRAFT');

  const [isLoading, setIsLoading] = useState<boolean>(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch workflow data if in Edit mode
  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchExisting = async () => {
      setIsLoading(true);
      try {
        const existing = await workflowService.getById(id);
        if (isMounted && existing) {
          setName(existing.metadata?.name || '');
          setDescription(existing.metadata?.description || '');
          setStatus(existing.metadata?.status || 'DRAFT');
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

  // Client-side validation
  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) {
      errors.name = 'Workflow name is required.';
    } else if (name.trim().length < 3) {
      errors.name = 'Workflow name must be at least 3 characters.';
    }

    if (!description.trim()) {
      errors.description = 'Description is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setFieldErrors({});

    const payload: CreateWorkflowRequest = {
      metadata: {
        name: name.trim(),
        description: description.trim(),
        version: 1,
        status,
      },
      nodes: [],
      edges: [],
    };

    try {
      if (isEditMode && id) {
        await workflowService.update(id, payload);
        addToast('success', `Workflow "${name}" updated successfully.`);
      } else {
        await workflowService.create(payload);
        addToast('success', `Workflow "${name}" created successfully.`);
      }
      navigate('/workflows');
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      if (apiErr.errors) {
        setFieldErrors(apiErr.errors);
      } else {
        addToast('error', apiErr.message || 'Failed to save workflow.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer title={isEditMode ? 'Edit Workflow' : 'Create Workflow'}>
        <Loader label="Loading workflow data..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={isEditMode ? 'Edit Workflow' : 'Create Workflow'}
      description={
        isEditMode
          ? 'Update your existing pipeline configuration.'
          : 'Define a new automated AI pipeline specification.'
      }
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

          {/* Description */}
          <div style={{ marginBottom: '1.25rem' }}>
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

          {/* Status */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
              Status
            </label>
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as WorkflowStatus)}
              disabled={isSubmitting}
              style={{ width: '100%' }}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/workflows')}
              disabled={isSubmitting}
            >
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
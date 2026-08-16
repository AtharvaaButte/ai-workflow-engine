
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useToast } from '../../hooks/useToast';
import { executionService } from '../../services/executionService';

interface ExecuteWorkflowModalProps {
  isOpen: boolean;
  workflowId: string;
  workflowName: string;
  onClose: () => void;
  onSuccess?: (executionId: string) => void;
}

export const ExecuteWorkflowModal: React.FC<ExecuteWorkflowModalProps> = ({
  isOpen,
  workflowId,
  workflowName,
  onClose,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const [inputJson, setInputJson] = useState<string>(
    '{\n  "customer_query": "I noticed an incorrect double deduction on my recent subscription invoice."\n}'
  );
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleExecute = async () => {
    let parsedInput: Record<string, unknown>;

    // 1. Validate JSON input
    try {
      parsedInput = JSON.parse(inputJson) as Record<string, unknown>;
      setJsonError(null);
    } catch {
      setJsonError('Invalid JSON format. Please check your syntax.');
      return;
    }

    // 2. Trigger execution API
    setIsExecuting(true);
    try {
      const response = await executionService.executeWorkflow(workflowId, parsedInput);
      addToast('success', `Workflow "${workflowName}" triggered successfully!`);
      onClose();
      if (onSuccess && response.id) {
        onSuccess(response.id);
      }
    } catch {
      addToast('error', 'Failed to execute workflow. Check backend execution logs.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`Run Workflow: ${workflowName}`}
      onClose={onClose}
      onConfirm={handleExecute}
      confirmLabel="Trigger Execution"
      confirmVariant="primary"
      isConfirming={isExecuting}
    >
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.875rem' }}>
          Input JSON Payload:
        </label>
        <textarea
          className="input"
          rows={6}
          value={inputJson}
          onChange={(e) => {
            setInputJson(e.target.value);
            setJsonError(null);
          }}
          placeholder='{ "customer_query": "Your message..." }'
          style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem' }}
          disabled={isExecuting}
        />
        {jsonError && (
          <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
            {jsonError}
          </span>
        )}
      </div>
    </Modal>
  );
};

export default ExecuteWorkflowModal;
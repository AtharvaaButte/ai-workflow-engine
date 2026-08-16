
import React, { useState } from 'react';
import type { Edge } from 'reactflow';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface EdgeConditionModalProps {
  edge: Edge | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCondition: (edgeId: string, condition: string | null) => void;
  onDeleteEdge: (edgeId: string) => void;
}

export const EdgeConditionModal: React.FC<EdgeConditionModalProps> = ({
  edge,
  isOpen,
  onClose,
  onSaveCondition,
  onDeleteEdge,
}) => {
  const [conditionValue, setConditionValue] = useState<string>(
    (edge?.data?.condition as string) || (edge?.label as string) || ''
  );

  if (!edge || !isOpen) return null;

  const handleSave = () => {
    const trimmed = conditionValue.trim();
    onSaveCondition(edge.id, trimmed || null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Branch Condition">
      <div style={{ padding: '0.5rem 0' }}>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>
          Route from <code>{edge.source}</code> &rarr; <code>{edge.target}</code>
        </p>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Routing Condition Value
          </label>
          <input
            type="text"
            className="input"
            style={{ width: '100%' }}
            placeholder="e.g. URGENT, billing, or else"
            value={conditionValue}
            onChange={(e) => setConditionValue(e.target.value)}
          />
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
            Enter an exact match value (e.g. <code>billing</code>) or <code>else</code> as default fallback.
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onDeleteEdge(edge.id);
              onClose();
            }}
          >
            Delete Edge
          </Button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save Condition
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
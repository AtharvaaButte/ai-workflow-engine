
import React, { useState } from 'react';
import type { Node } from 'reactflow';
import {
  X,
  Trash2,
  Check,
  Sparkles,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  Mail,
  GitBranch,
  Send,
  SlidersHorizontal,
  Info,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface NodeConfigDrawerProps {
  node: Node;
  onClose: () => void;
  onUpdateConfig: (nodeId: string, newConfig: Record<string, unknown>, newId?: string) => void;
  onDeleteNode: (nodeId: string) => void;
}

export const NodeConfigDrawer: React.FC<NodeConfigDrawerProps> = ({
  node,
  onClose,
  onUpdateConfig,
  onDeleteNode,
}) => {
  const [nodeId, setNodeId] = useState<string>(node.id);
  const [config, setConfig] = useState<Record<string, unknown>>(
    (node.data?.config as Record<string, unknown>) || {}
  );
  const [emailMode, setEmailMode] = useState<'static' | 'dynamic'>(
    config.recipientKey ? 'dynamic' : 'static'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validateAndSave = () => {
    const newErrors: Record<string, string> = {};

    if (!nodeId.trim()) {
      newErrors.nodeId = 'Node identifier is required';
    }

    const provider = typeof config.provider === 'string' ? config.provider.trim() : '';
    const inputKey = typeof config.inputKey === 'string' ? config.inputKey.trim() : '';
    const outputKey = typeof config.outputKey === 'string' ? config.outputKey.trim() : '';
    const prompt = typeof config.prompt === 'string' ? config.prompt.trim() : '';
    const apiKey = typeof config.apiKey === 'string' ? config.apiKey.trim() : '';
    const field = typeof config.field === 'string' ? config.field.trim() : '';
    const subject = typeof config.subject === 'string' ? config.subject.trim() : '';
    const from = typeof config.from === 'string' ? config.from.trim() : '';
    const recipient = typeof config.recipient === 'string' ? config.recipient.trim() : '';
    const recipientKey = typeof config.recipientKey === 'string' ? config.recipientKey.trim() : '';
    const responseKeys = typeof config.responseKeys === 'string' ? config.responseKeys.trim() : '';

    switch (node.type) {
      case 'ai_processor':
        if (!provider) newErrors.provider = 'Provider is mandatory';
        if (!inputKey) newErrors.inputKey = 'Input key is mandatory';
        if (!outputKey) newErrors.outputKey = 'Output key is mandatory';
        if (!prompt) newErrors.prompt = 'Prompt template is required';
        if (!apiKey) newErrors.apiKey = 'API Key is required';
        break;

      case 'condition':
        if (!field) newErrors.field = 'Context field name is required';
        break;

      case 'send_email':
        if (!apiKey) newErrors.apiKey = 'Resend API key is required';
        if (!from) newErrors.from = 'Sender email address is required';
        if (!subject) newErrors.subject = 'Subject line is required';
        if (emailMode === 'static' && !recipient) newErrors.recipient = 'Recipient email is required';
        if (emailMode === 'dynamic' && !recipientKey) newErrors.recipientKey = 'Context variable key is required';
        break;

      case 'response':
        if (!responseKeys) newErrors.responseKeys = 'Response keys are required';
        break;

      default:
        break;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const sanitizedConfig = { ...config };
    if (node.type === 'send_email') {
      if (emailMode === 'static') delete sanitizedConfig.recipientKey;
      else delete sanitizedConfig.recipient;
    }

    onUpdateConfig(node.id, sanitizedConfig, nodeId.trim());
    onClose();
  };

  return (
    <aside
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '430px',
        height: '100%',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e2e8f0',
        boxShadow: '-10px 0 35px rgba(15, 23, 42, 0.08)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. Header Banner */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              padding: '0.45rem',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
            }}
          >
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>
              Node Inspector
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Type: <strong style={{ color: '#2563eb' }}>{node.type}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '5px',
            cursor: 'pointer',
            color: '#64748b',
            display: 'flex',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* 2. Scrollable Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        {/* Node Identifier Card */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#334155',
              marginBottom: '0.4rem',
            }}
          >
            <Layers size={14} color="#64748b" /> Node ID / Label <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            className="drawer-input"
            value={nodeId}
            onChange={(e) => {
              setNodeId(e.target.value);
              if (errors.nodeId) setErrors((prev) => ({ ...prev, nodeId: '' }));
            }}
            placeholder="unique_node_identifier"
          />
          {errors.nodeId && <span className="drawer-error">{errors.nodeId}</span>}
        </div>

        {/* AI Processor Config */}
        {node.type === 'ai_processor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Task Type */}
            <div>
              <label className="drawer-label">
                <Sparkles size={14} color="#7c3aed" /> Task Mode
              </label>
              <select
                className="drawer-select"
                value={(config.task as string) || 'classification'}
                onChange={(e) => handleChange('task', e.target.value)}
              >
                <option value="classification">Classification (Categorization & Routing)</option>
                <option value="summarization">Summarization (Compress Input Payload)</option>
                <option value="generation">Generation (Draft Freeform Output)</option>
              </select>
            </div>

            {/* Provider & API Key */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.75rem' }}>
              <div>
                <label className="drawer-label">Provider <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  className="drawer-select"
                  value={(config.provider as string) || 'openai'}
                  onChange={(e) => handleChange('provider', e.target.value)}
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="gemini">Google Gemini</option>
                </select>
              </div>

              <div>
                <label className="drawer-label">
                  <KeyRound size={13} /> API Key <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="password"
                  className="drawer-input"
                  placeholder="sk-proj-..."
                  value={(config.apiKey as string) || ''}
                  onChange={(e) => handleChange('apiKey', e.target.value)}
                />
              </div>
            </div>
            {errors.apiKey && <span className="drawer-error">{errors.apiKey}</span>}

            {/* Context Variable Routing Box */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.85rem',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
                PAYLOAD DATA FLOW
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.4rem', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>
                    Read From:
                  </span>
                  <input
                    type="text"
                    className="drawer-input"
                    placeholder="customer_query"
                    value={(config.inputKey as string) || ''}
                    onChange={(e) => handleChange('inputKey', e.target.value)}
                  />
                </div>

                <div style={{ color: '#94a3b8', marginTop: '1rem' }}>
                  <ArrowRight size={15} />
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>
                    Save Output To:
                  </span>
                  <input
                    type="text"
                    className="drawer-input"
                    placeholder="ticket_category"
                    value={(config.outputKey as string) || ''}
                    onChange={(e) => handleChange('outputKey', e.target.value)}
                  />
                </div>
              </div>
              {(errors.inputKey || errors.outputKey) && (
                <span className="drawer-error">{errors.inputKey || errors.outputKey}</span>
              )}
            </div>

            {/* Prompt Template */}
            <div>
              <label className="drawer-label">
                Prompt Template <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                className="drawer-textarea"
                rows={4}
                placeholder="Classify user query into billing or technical: {{customer_query}}"
                value={(config.prompt as string) || ''}
                onChange={(e) => handleChange('prompt', e.target.value)}
              />
              {errors.prompt && <span className="drawer-error">{errors.prompt}</span>}
            </div>
          </div>
        )}

        {/* Condition Router Config */}
        {node.type === 'condition' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="drawer-label">
                <GitBranch size={14} color="#d97706" /> Evaluation Field Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="drawer-input"
                placeholder="ticket_category"
                value={(config.field as string) || ''}
                onChange={(e) => handleChange('field', e.target.value)}
              />
              {errors.field && <span className="drawer-error">{errors.field}</span>}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '0.65rem',
                padding: '0.85rem',
                backgroundColor: '#fffbeb',
                borderRadius: '8px',
                border: '1px solid #fef3c7',
                fontSize: '0.8rem',
                color: '#92400e',
              }}
            >
              <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                Assign matching conditions (e.g. <code>billing</code> or <code>else</code>) directly to the outgoing edge lines connecting from this node.
              </div>
            </div>
          </div>
        )}

        {/* Email Node Config */}
        {node.type === 'send_email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="drawer-label">
                <KeyRound size={13} /> Resend API Key <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                className="drawer-input"
                placeholder="re_123456789"
                value={(config.apiKey as string) || ''}
                onChange={(e) => handleChange('apiKey', e.target.value)}
              />
              {errors.apiKey && <span className="drawer-error">{errors.apiKey}</span>}
            </div>

            <div>
              <label className="drawer-label">
                From Sender <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                className="drawer-input"
                placeholder="notifications@yourdomain.dev"
                value={(config.from as string) || ''}
                onChange={(e) => handleChange('from', e.target.value)}
              />
              {errors.from && <span className="drawer-error">{errors.from}</span>}
            </div>

            <div>
              <label className="drawer-label">Recipient Mode</label>
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEmailMode('static')}
                  className={`toggle-btn ${emailMode === 'static' ? 'active' : ''}`}
                >
                  Direct Email
                </button>
                <button
                  type="button"
                  onClick={() => setEmailMode('dynamic')}
                  className={`toggle-btn ${emailMode === 'dynamic' ? 'active' : ''}`}
                >
                  Context Key
                </button>
              </div>

              {emailMode === 'static' ? (
                <input
                  type="email"
                  className="drawer-input"
                  placeholder="user@example.com"
                  value={(config.recipient as string) || ''}
                  onChange={(e) => handleChange('recipient', e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  className="drawer-input"
                  placeholder="e.g., customer_email"
                  value={(config.recipientKey as string) || ''}
                  onChange={(e) => handleChange('recipientKey', e.target.value)}
                />
              )}
            </div>

            <div>
              <label className="drawer-label">
                <Mail size={13} /> Subject Line <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="drawer-input"
                placeholder="Urgent Workflow Alert"
                value={(config.subject as string) || ''}
                onChange={(e) => handleChange('subject', e.target.value)}
              />
              {errors.subject && <span className="drawer-error">{errors.subject}</span>}
            </div>
          </div>
        )}

        {/* Response Config */}
        {node.type === 'response' && (
          <div>
            <label className="drawer-label">
              <Send size={13} color="#059669" /> Return Keys <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="drawer-input"
              placeholder="ticket_category, node_ai_status"
              value={(config.responseKeys as string) || ''}
              onChange={(e) => handleChange('responseKeys', e.target.value)}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
              Comma-separated variable keys to return in the final API response.
            </span>
            {errors.responseKeys && <span className="drawer-error">{errors.responseKeys}</span>}
          </div>
        )}

        {/* HTTP Trigger Banner */}
        {node.type === 'http_trigger' && (
          <div
            style={{
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '0.85rem',
              color: '#475569',
            }}
          >
            <ShieldCheck size={22} color="#2563eb" style={{ marginBottom: '0.4rem' }} />
            <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.25rem' }}>
              Pipeline Ingress Endpoint
            </strong>
            Payloads posted to this workflow execution webhook automatically populate the root execution context.
          </div>
        )}
      </div>

      {/* 3. Footer Action Controls */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
        }}
      >
        <Button variant="danger" size="sm" onClick={() => onDeleteNode(node.id)}>
          <Trash2 size={14} /> Delete
        </Button>
        <Button variant="primary" size="sm" onClick={validateAndSave}>
          <Check size={14} /> Apply Settings
        </Button>
      </div>

      {/* Embedded Component CSS */}
      <style>{`
        .drawer-label {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.35rem;
        }
        .drawer-input,
        .drawer-select,
        .drawer-textarea {
          width: 100%;
          padding: 0.55rem 0.75rem;
          font-size: 0.85rem;
          color: #0f172a;
          background-color: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          font-family: inherit;
        }
        .drawer-input:focus,
        .drawer-select:focus,
        .drawer-textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }
        .drawer-error {
          color: #ef4444;
          font-size: 0.72rem;
          margin-top: 0.25rem;
          display: block;
          font-weight: 500;
        }
        .toggle-btn {
          flex: 1;
          padding: 0.4rem 0.6rem;
          font-size: 0.78rem;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background-color: #f8fafc;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .toggle-btn.active {
          background-color: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
        }
      `}</style>
    </aside>
  );
};
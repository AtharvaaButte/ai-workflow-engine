
import React, { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Zap, Bot, GitBranch, Mail, Send, CheckCircle2, Plus, X } from 'lucide-react';

interface NodeMeta {
  label: string;
  color: string;
  badgeBg: string;
  icon: React.ReactNode;
  isTrigger?: boolean;
  isTerminal?: boolean;
}

const NODE_META: Record<string, NodeMeta> = {
  http_trigger: {
    label: 'HTTP Trigger',
    color: '#2563eb',
    badgeBg: '#eff6ff',
    icon: <Zap size={15} color="#2563eb" />,
    isTrigger: true,
  },
  ai_processor: {
    label: 'AI Processor',
    color: '#7c3aed',
    badgeBg: '#f5f3ff',
    icon: <Bot size={15} color="#7c3aed" />,
  },
  condition: {
    label: 'Condition Router',
    color: '#d97706',
    badgeBg: '#fffbeb',
    icon: <GitBranch size={15} color="#d97706" />,
  },
  send_email: {
    label: 'Send Email',
    color: '#db2777',
    badgeBg: '#fdf2f8',
    icon: <Mail size={15} color="#db2777" />,
  },
  response: {
    label: 'HTTP Response',
    color: '#059669',
    badgeBg: '#ecfdf5',
    icon: <Send size={15} color="#059669" />,
    isTerminal: true,
  },
};

export const WorkflowNode = memo(({ id, type, data, selected }: NodeProps) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const meta = NODE_META[type] || {
    label: type,
    color: '#475569',
    badgeBg: '#f1f5f9',
    icon: <Zap size={15} />,
  };

  const onQuickAddClick = (targetType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuickAdd(false);
    if (data?.onQuickConnect) {
      data.onQuickConnect(id, targetType);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        background: '#ffffff',
        borderRadius: '12px',
        padding: '0.9rem 1.1rem',
        minWidth: '220px',
        maxWidth: '260px',
        boxShadow: selected
          ? `0 0 0 2px ${meta.color}, 0 12px 24px -4px rgba(0, 0, 0, 0.12)`
          : '0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        border: `1.5px solid ${selected ? meta.color : '#e2e8f0'}`,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      }}
    >
      {/* Target Handle (Left Port) */}
      {!meta.isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: '#64748b',
            width: 10,
            height: 10,
            border: '2px solid #ffffff',
          }}
        />
      )}

      {/* Node Header Pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '3px 8px',
            borderRadius: '6px',
            backgroundColor: meta.badgeBg,
          }}
        >
          {meta.icon}
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: meta.color, letterSpacing: '0.02em' }}>
            {meta.label}
          </span>
        </div>

        <CheckCircle2 size={14} color="#10b981" />
      </div>

      {/* Node Name / ID */}
      <div
        style={{
          fontSize: '0.9rem',
          fontWeight: 700,
          color: '#0f172a',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={id}
      >
        {id}
      </div>

      {/* Dynamic Key Metadata Previews */}
      <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
        {type === 'ai_processor' && (
          <>
            <div>Task: <strong style={{ color: '#0f172a' }}>{data?.config?.task || 'classification'}</strong></div>
            <div>In &rarr; Out: <code style={{ color: '#7c3aed' }}>{data?.config?.inputKey || 'input'} &rarr; {data?.config?.outputKey || 'output'}</code></div>
          </>
        )}
        {type === 'condition' && (
          <div>Eval Field: <code style={{ color: '#d97706' }}>{data?.config?.field || 'not set'}</code></div>
        )}
        {type === 'send_email' && (
          <div>Subject: <strong style={{ color: '#0f172a' }}>{data?.config?.subject ? `${data.config.subject.slice(0, 16)}...` : 'Alert'}</strong></div>
        )}
        {type === 'response' && (
          <div>Return Keys: <code style={{ color: '#059669' }}>{data?.config?.responseKeys || 'all'}</code></div>
        )}
      </div>

      {/* Source Handle (Right Port) */}
      {!meta.isTerminal && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: meta.color,
            width: 10,
            height: 10,
            border: '2px solid #ffffff',
          }}
        />
      )}

      {/* Quick Add Next Step Action Button */}
      {!meta.isTerminal && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowQuickAdd((prev) => !prev);
          }}
          title="Connect Next Step"
          style={{
            position: 'absolute',
            right: '-14px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: `1.5px solid ${meta.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
            zIndex: 10,
          }}
        >
          {showQuickAdd ? <X size={12} color={meta.color} /> : <Plus size={12} color={meta.color} />}
        </button>
      )}

      {/* Quick Connect Dropdown Menu */}
      {showQuickAdd && (
        <div
          style={{
            position: 'absolute',
            left: '105%',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            padding: '0.4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            minWidth: '150px',
            zIndex: 100,
          }}
        >
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', padding: '2px 6px' }}>
            CONNECT NEXT:
          </div>
          <button className="quick-add-btn" onClick={(e) => onQuickAddClick('ai_processor', e)}>
            <Bot size={13} color="#7c3aed" /> AI Processor
          </button>
          <button className="quick-add-btn" onClick={(e) => onQuickAddClick('condition', e)}>
            <GitBranch size={13} color="#d97706" /> Condition Router
          </button>
          <button className="quick-add-btn" onClick={(e) => onQuickAddClick('send_email', e)}>
            <Mail size={13} color="#db2777" /> Send Email
          </button>
          <button className="quick-add-btn" onClick={(e) => onQuickAddClick('response', e)}>
            <Send size={13} color="#059669" /> Response
          </button>
        </div>
      )}

      <style>{`
        .quick-add-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.5rem;
          font-size: 0.78rem;
          font-weight: 500;
          color: #334155;
          background: transparent;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }
        .quick-add-btn:hover {
          background: #f1f5f9;
        }
      `}</style>
    </div>
  );
});

// eslint-disable-next-line react-refresh/only-export-components
export const nodeTypes = {
  http_trigger: WorkflowNode,
  ai_processor: WorkflowNode,
  condition: WorkflowNode,
  send_email: WorkflowNode,
  response: WorkflowNode,
};
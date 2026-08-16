
import React from 'react';
import { Zap, Bot, GitBranch, Mail, Send, Sparkles } from 'lucide-react';

interface CanvasToolbarProps {
  onAddNode: (type: string) => void;
  onLoadTemplate: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ onAddNode, onLoadTemplate }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 15,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        backgroundColor: '#ffffff',
        padding: '0.5rem 0.75rem',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <button
        onClick={() => onAddNode('http_trigger')}
        className="btn-toolbar"
        title="Add HTTP Trigger Node"
      >
        <Zap size={15} color="#3b82f6" /> + Trigger
      </button>

      <button
        onClick={() => onAddNode('ai_processor')}
        className="btn-toolbar"
        title="Add AI Processor Node"
      >
        <Bot size={15} color="#8b5cf6" /> + AI Model
      </button>

      <button
        onClick={() => onAddNode('condition')}
        className="btn-toolbar"
        title="Add Condition Node"
      >
        <GitBranch size={15} color="#f59e0b" /> + Condition
      </button>

      <button
        onClick={() => onAddNode('send_email')}
        className="btn-toolbar"
        title="Add Email Action"
      >
        <Mail size={15} color="#ec4899" /> + Email
      </button>

      <button
        onClick={() => onAddNode('response')}
        className="btn-toolbar"
        title="Add Final Response Node"
      >
        <Send size={15} color="#10b981" /> + Response
      </button>

      <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0', margin: '0 0.25rem' }} />

      <button
        onClick={onLoadTemplate}
        className="btn-toolbar"
        style={{ color: '#8b5cf6', fontWeight: 600 }}
        title="Load Pre-configured AI Support Routing Chain"
      >
        <Sparkles size={15} color="#8b5cf6" /> AI Router Template
      </button>

      <style>{`
        .btn-toolbar {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.4rem 0.65rem;
          font-size: 0.8rem;
          font-weight: 500;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-toolbar:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
      `}</style>
    </div>
  );
};
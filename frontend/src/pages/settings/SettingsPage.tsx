// src/pages/SettingsPage.tsx

import React, { useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../hooks/useToast';
import { Sun, Moon, ShieldCheck, Key } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();

  const [defaultOpenAiKey, setDefaultOpenAiKey] = useState<string>(() => {
    return localStorage.getItem('default_openai_key') || '';
  });
  const [defaultResendKey, setDefaultResendKey] = useState<string>(() => {
    return localStorage.getItem('default_resend_key') || '';
  });

  const handleSaveDefaults = (e: React.FormEvent) => {
    e.preventDefault();
    if (defaultOpenAiKey) localStorage.setItem('default_openai_key', defaultOpenAiKey.trim());
    else localStorage.removeItem('default_openai_key');

    if (defaultResendKey) localStorage.setItem('default_resend_key', defaultResendKey.trim());
    else localStorage.removeItem('default_resend_key');

    addToast('success', 'Default credential preferences saved!');
  };

  return (
    <PageContainer
      title="Platform Settings"
      description="Customize appearance, manage account credentials, and configure default workflow API keys."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
        {/* 1. Appearance / Theme Customizer */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Appearance & Theme</h3>
              <p className="card-subtitle">Choose how the AI Workflow Engine interface looks to you.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
            {/* Light Mode Option */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                borderRadius: 'var(--radius)',
                border: `2px solid ${theme === 'light' ? 'var(--primary)' : 'var(--border-color)'}`,
                background: 'var(--bg-main)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ padding: '0.5rem', borderRadius: '50%', background: '#fef3c7', color: '#d97706' }}>
                <Sun size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Light Mode</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Clean, high contrast</span>
              </div>
            </button>

            {/* Dark Mode Option */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                borderRadius: 'var(--radius)',
                border: `2px solid ${theme === 'dark' ? 'var(--primary)' : 'var(--border-color)'}`,
                background: 'var(--bg-main)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ padding: '0.5rem', borderRadius: '50%', background: '#312e81', color: '#a5b4fc' }}>
                <Moon size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Dark Mode</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Easy on the eyes</span>
              </div>
            </button>
          </div>
        </div>

        {/* 2. User Account Profile */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">User Account</h3>
              <p className="card-subtitle">Active authenticated user session details.</p>
            </div>
            <ShieldCheck size={20} color="var(--primary)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input type="text" className="input-field" value={user?.name || ''} disabled />
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input type="email" className="input-field" value={user?.email || ''} disabled />
            </div>

            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label className="input-label">User ID (UUID)</label>
              <input type="text" className="input-field" value={user?.userId || ''} disabled style={{ fontFamily: 'monospace' }} />
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
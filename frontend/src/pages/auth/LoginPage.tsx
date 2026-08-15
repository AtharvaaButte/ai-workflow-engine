
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';

interface BackendError {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login({ email, password });
      addToast('success', 'Logged in successfully!');
    } catch (err: unknown) {
      const apiErr = err as BackendError;
      const msg = apiErr.error || 'Invalid email or password.';
      setErrorMessage(msg);
      addToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'var(--bg-primary, #0f172a)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', textAlign: 'center' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Sign in to manage and execute AI workflows
        </p>

        {errorMessage && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#dc2626', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={isSubmitting}
              style={{ width: '100%' }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
              style={{ width: '100%' }}
              required
            />
          </div>

          <Button type="submit" variant="primary" disabled={isSubmitting} style={{ width: '100%', padding: '0.65rem' }}>
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '1.5rem', marginBottom: 0, color: 'var(--text-muted, #64748b)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary, #3b82f6)', fontWeight: 600, textDecoration: 'none' }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

import{ Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            height: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-primary, #0f172a)',
            padding: '1rem',
          }}
        >
          <div
            style={{
              padding: '2rem',
              backgroundColor: 'var(--bg-card, #1e293b)',
              border: '1px solid var(--border-color, #334155)',
              borderRadius: '12px',
              maxWidth: '480px',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            }}
          >
            <h2 style={{ marginTop: 0, color: 'var(--danger, #ef4444)' }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              An unexpected UI error occurred. You can return to safety by resetting the view.
            </p>
            <Button variant="primary" onClick={this.handleReset}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
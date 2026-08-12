
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <PageContainer title="404 - Page Not Found">
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          maxWidth: '520px',
          margin: '2rem auto',
        }}
      >
        <h1 style={{ fontSize: '3.5rem', margin: 0, color: 'var(--primary, #3b82f6)' }}>404</h1>
        <h3 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Page Not Found</h3>
        <p style={{ color: 'var(--text-muted, #64748b)', marginBottom: '1.5rem' }}>
          The page or route you are looking for does not exist or has been moved.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            &larr; Go Back
          </Button>
          <Button variant="primary" onClick={() => navigate('/')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

import { PageContainer } from '../../components/layout/PageContainer';

export default function SettingsPage() {
  return (
    <PageContainer title="Settings" description="Manage engine configurations and environment keys.">
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3>Engine Settings</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Environment API Base URL: <code>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}</code>
        </p>
      </div>
    </PageContainer>
  );
}
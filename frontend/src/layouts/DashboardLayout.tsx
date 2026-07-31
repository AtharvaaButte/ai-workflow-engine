import { Outlet } from 'react-router-dom';

export const DashboardLayout = () => {
  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Placeholder */}
      <aside style={{ width: '240px', borderRight: '1px solid #e5e7eb', padding: '1rem' }}>
        <h3>AI Engine</h3>
        {/* Navigation links will go here in Phase 2 */}
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header Placeholder */}
        <header style={{ height: '60px', borderBottom: '1px solid #e5e7eb', padding: '0 1.5rem', display: 'flex', alignItems: 'center' }}>
          <span>Header / Breadcrumbs</span>
        </header>

        {/* Page Content Outlet */}
        <main style={{ flex: 1, padding: '1.5rem', backgroundColor: '#f9fafb' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
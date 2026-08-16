// src/components/layout/DashboardLayout.tsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="layout-container">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar with dynamic open class */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Layout Area */}
      <div className="layout-main">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

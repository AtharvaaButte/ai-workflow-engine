
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  PlayCircle,
  Settings,
  Zap,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Zap size={20} color="#2563eb" />
          <span className="brand-title">AI Workflow Engine</span>
        </div>
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav Navigation Links */}
      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          onClick={onClose}
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
          }
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/workflows"
          onClick={onClose}
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
          }
        >
          <GitBranch size={18} />
          <span>Workflows</span>
        </NavLink>

        <NavLink
          to="/executions"
          onClick={onClose}
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
          }
        >
          <PlayCircle size={18} />
          <span>Executions</span>
        </NavLink>

        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
          }
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Footer Info */}
      <div className="sidebar-footer">
        <span>AI Engine v1.0.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
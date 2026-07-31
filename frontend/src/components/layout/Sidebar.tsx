
import React from 'react';
import { NavLink } from 'react-router-dom';
import { SIDEBAR_MENU, APP_NAME } from '../../constants/constants';

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">⚡</div>
        <span className="brand-title">{APP_NAME}</span>
      </div>

      <nav className="sidebar-nav">
        {SIDEBAR_MENU.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'} // Strict matching for home route
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <span className="link-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="version-tag">v1.0.0-dev</span>
      </div>
    </aside>
  );
};
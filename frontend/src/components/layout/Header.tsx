
import React from 'react';
import { Breadcrumb } from './Breadcrumb';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="hamburger-btn" onClick={onToggleSidebar} aria-label="Toggle menu">
          ☰
        </button>
        <Breadcrumb />
      </div>

      <div className="header-actions">
        <div className="search-placeholder">
          <input type="text" placeholder="Search workflows..." disabled />
        </div>
        <div className="user-profile-placeholder">
          <div className="avatar">A</div>
          <span className="user-name">Admin</span>
        </div>
      </div>
    </header>
  );
};
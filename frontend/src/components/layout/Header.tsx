
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from './Breadcrumb';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { Search, LogOut, User as UserIcon, ChevronDown, Sun, Moon, Sparkles } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/workflows?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const displayName = user?.name || 'User';

  return (
    <header className="header-bar">
      <div className="header-left-zone">
        <button className="nav-toggle-btn" onClick={onToggleSidebar} aria-label="Toggle menu">
          ☰
        </button>
        <Breadcrumb />
      </div>

      <div className="header-right-zone">
        {/* Modern Search Capsule */}
        <div className="search-capsule">
          <Search size={15} className="search-icon-svg" />
          <input
            type="text"
            className="search-capsule-input"
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <kbd className="search-shortcut">⌘K</kbd>
        </div>

        {/* Quick Theme Toggle Button */}
        <button
          type="button"
          className="theme-quick-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#6366f1" />}
        </button>

        {/* Modern User Profile Pill */}
        <div className="user-profile-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className="user-profile-pill"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
          >
            <div className="user-avatar-badge">{initial}</div>
            <span className="user-pill-name">{displayName}</span>
            <ChevronDown size={14} className={`pill-chevron ${isDropdownOpen ? 'open' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isDropdownOpen && (
            <div className="profile-studio-dropdown">
              <div className="dropdown-account-header">
                <div className="dropdown-name-title">{displayName}</div>
                <div className="dropdown-email-sub">{user?.email || 'authenticated'}</div>
              </div>

              <div className="dropdown-separator" />

              <button
                type="button"
                className="dropdown-action-btn"
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/workflows');
                }}
              >
                <UserIcon size={15} />
                <span>My Pipelines</span>
              </button>

              <button
                type="button"
                className="dropdown-action-btn"
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/settings');
                }}
              >
                <Sparkles size={15} />
                <span>Settings & Vault</span>
              </button>

              <div className="dropdown-separator" />

              <button
                type="button"
                className="dropdown-action-btn logout-danger"
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
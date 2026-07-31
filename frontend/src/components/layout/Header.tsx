
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const location = useLocation();

  // Split current pathname into breadcrumb path segments
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <header className="header">
      {/* Dynamic Breadcrumbs */}
      <div className="header-breadcrumbs">
        <Link to="/" className="breadcrumb-item">Home</Link>
        {pathSegments.map((segment, index) => {
          const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          const label = segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <React.Fragment key={url}>
              <span className="breadcrumb-separator">/</span>
              {isLast ? (
                <span className="breadcrumb-item active">{label}</span>
              ) : (
                <Link to={url} className="breadcrumb-item">{label}</Link>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Header Utilities */}
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
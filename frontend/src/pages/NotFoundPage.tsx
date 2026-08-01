
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="error-page-container">
      <div className="error-code">404</div>
      <h2>Page Not Found</h2>
      <p>The page or resource you are looking for does not exist.</p>
      <Link to="/" style={{ textDecoration: 'none', marginTop: '1rem' }}>
        <Button variant="primary">Return to Dashboard</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
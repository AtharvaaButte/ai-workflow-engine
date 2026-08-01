
import React from 'react';

interface SkeletonProps {
  height?: string;
  width?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  height = '20px',
  width = '100%',
  className = '',
}) => {
  return (
    <div
      className={`skeleton-loader ${className}`}
      style={{ height, width }}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Skeleton height="24px" width="40%" />
      <Skeleton height="16px" width="80%" />
      <Skeleton height="16px" width="60%" />
    </div>
  );
};
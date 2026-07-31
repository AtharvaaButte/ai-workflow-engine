
import React from 'react';

interface LoaderProps {
  label?: string;
  fullPage?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  label = 'Loading...',
  fullPage = false,
}) => {
  const content = (
    <div className="loader-container">
      <div className="spinner" />
      {label && <span className="loader-label">{label}</span>}
    </div>
  );

  if (fullPage) {
    return <div className="loader-fullpage">{content}</div>;
  }

  return content;
};
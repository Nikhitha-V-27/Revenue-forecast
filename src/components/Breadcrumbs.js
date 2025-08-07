import React from 'react';
import { useNavigate } from 'react-router-dom';

const Breadcrumbs = ({ path }) => {
  const navigate = useNavigate();

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb bg-white rounded shadow-sm p-3 mb-4">
        {path.map((step, index) => (
          <li
            key={index}
            className={`breadcrumb-item ${index === path.length - 1 ? 'active' : ''}`}
            aria-current={index === path.length - 1 ? 'page' : undefined}
          >
            {/* Render as plain text if it's the last item OR if 'page' is explicitly null/undefined.
                An empty string '' for 'page' should still be clickable (navigates to /). */}
            {index === path.length - 1 || step.page === null || step.page === undefined ? (
              step.name
            ) : (
              <button
                className="btn btn-link text-decoration-none p-0"
                onClick={() => navigate(`/${step.page}`)}
              >
                {step.name}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

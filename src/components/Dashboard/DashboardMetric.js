import React from 'react';

const DashboardMetric = ({ value, label }) => (
  <div className="col-6 col-md-3 mb-4">
    <div className="d-flex flex-column align-items-center"> {/* Center content */}
      <h4 className="fw-bold mb-1" style={{ fontSize: '2.2rem', color: '#2c3e50' }}>{value}</h4> {/* Larger value, darker text */}
      <p className="small text-muted text-uppercase mb-0" style={{ letterSpacing: '0.05em' }}>{label}</p> {/* Uppercase label, subtle spacing */}
    </div>
  </div>
);

export default DashboardMetric;

import React from 'react';

const DashboardCard = ({ title, description, icon, onClick }) => ( // 'icon' prop instead of 'iconClass'
  <div className="col-12 col-sm-6 col-lg-4">
    <div
      className="card h-100 shadow-sm border-0 text-center p-4 cursor-pointer d-flex flex-column justify-content-between align-items-center transition-transform"
      onClick={onClick}
      style={{
        borderRadius: '0.75rem',
        backgroundColor: '#fff',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
      }}
    >
      <div className="card-body d-flex flex-column align-items-center justify-content-center">
        {/* Using emoji icon directly */}
        <div className="mb-3" style={{ fontSize: '3.5rem' }}> {/* Font size for emojis */}
          {icon}
        </div>
        <h5 className="fw-bold text-dark mb-2">{title}</h5>
        <p className="text-muted small mb-0">{description}</p>
      </div>
    </div>
  </div>
);

export default DashboardCard;
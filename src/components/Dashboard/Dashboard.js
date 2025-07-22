// good non integrated
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import DashboardCard from './DashboardCard';
// import DashboardMetric from './DashboardMetric';
// import dashboardData from '../../data/dashboard.json';
// import DatePicker from 'react-datepicker'; // Import DatePicker
// // REMEMBER: The CSS import for react-datepicker should be in App.js or index.js
// // import 'react-datepicker/dist/react-datepicker.css'; 

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [message, setMessage] = useState('');
//   const [showMessageBox, setShowMessageBox] = useState(false);
//   const [showRevenueOptions, setShowRevenueOptions] = useState(false);
//   // Removed showGetDataMonthYearPopup and selectedDateGetData states
//   const [showViewPastDataPopup, setShowViewPastDataPopup] = useState(false); // State for View Past Data popup

//   const [selectedDateViewPast, setSelectedDateViewPast] = useState(null); // Date for View Past Data popup

//   const { header, metrics, cards, revenuePopup } = dashboardData;

//   useEffect(() => {
//     const link = document.createElement('link');
//     link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
//     link.rel = 'stylesheet';
//     document.head.appendChild(link);
//     document.body.style.fontFamily = "'Poppins', sans-serif";
//   }, []);

//   const showMessage = (msg) => {
//     setMessage(msg);
//     setShowMessageBox(true);
//   };

//   const hideMessage = () => setShowMessageBox(false);
//   const toggleRevenueOptions = () => setShowRevenueOptions(prev => !prev);

//   // Corrected navigation for View Past Data to go to Account Level
//   const handleViewPastData = () => {
//     if (!selectedDateViewPast) {
//       alert('Please select both a month and a year to View Past Data.');
//       return;
//     }
//     setShowViewPastDataPopup(false);
//     // CORRECTED: Navigate to the Account Level
//     navigate('/accounts'); 
//   };

//   // Determine if any popup is open to show the backdrop
//   const isPopupOpen = showMessageBox || showRevenueOptions || showViewPastDataPopup;

//   return (
//     <div
//       className="position-relative min-vh-100 d-flex justify-content-center align-items-center px-3"
//       style={{
//         background: 'radial-gradient(circle at center, #f8f9fa 60%, #e0e0e0 100%)',
//         overflow: 'hidden'
//       }}
//     >
//       {isPopupOpen && (
//         <div
//           className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-25"
//           style={{ backdropFilter: 'blur(3px)', zIndex: 1 }}
//         />
//       )}

//       <div
//         className="card rounded-4 shadow-lg w-100"
//         style={{ maxWidth: '1100px', zIndex: 2, backgroundColor: 'rgba(255,255,255,0.95)' }}
//       >
//         <div className="card-body">
//           <h2 className="text-center fw-bold text-dark mb-2">{header.title}</h2>
//           <p className="text-center text-muted mb-4">{header.subtitle}</p>

//           <div className="card bg-light border-0 shadow-sm p-4 mb-4 rounded-3">
//             <div className="row g-4">
//               {cards.map((card, index) => (
//                 <DashboardCard
//                   key={index}
//                   title={card.title}
//                   description={card.description}
//                   icon={card.icon}
//                   onClick={
//                     card.title === 'Revenue Forecast'
//                       ? toggleRevenueOptions // This opens the first popup
//                       : () => showMessage(`Navigating to ${card.title}`)
//                   }
//                 />
//               ))}
//             </div>
//           </div>

//           <div className="card bg-light border-0 shadow-sm p-4 rounded-3">
//             <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
//               {metrics.map((metric, index) => (
//                 <DashboardMetric key={index} value={metric.value} label={metric.label} />
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {showMessageBox && (
//         <div
//           className="position-fixed top-50 start-50 translate-middle bg-dark text-white p-4 rounded shadow text-center"
//           style={{ zIndex: 999 }}
//         >
//           <p className="mb-3">{message}</p>
//           <button className="btn btn-light btn-sm" onClick={hideMessage}>Close</button>
//         </div>
//       )}

//       {/* First popup: Revenue Forecast Options */}
//       {showRevenueOptions && (
//         <div
//           className="position-fixed top-50 start-50 translate-middle bg-white p-4 rounded shadow text-center"
//           style={{ zIndex: 999 }}
//         >
//           <h5 className="fw-bold mb-3 text-dark">{revenuePopup.title}</h5>
//           {revenuePopup.buttons.map((btn, i) => (
//             <button
//               key={i}
//               className={`btn btn-outline-${btn.variant} w-100 mb-2`}
//               onClick={() => {
//                 if (btn.action === 'upload') {
//                   toggleRevenueOptions(); // Close this popup
//                   navigate('/upload'); // Navigate to upload page
//                 } else if (btn.action === 'viewPastData') { // Action for View Past Data
//                   toggleRevenueOptions(); // Close this popup
//                   setSelectedDateViewPast(null); // Reset selected date for this popup
//                   setShowViewPastDataPopup(true); // Open the "View Past Data" Month/Year selection popup
//                 } else { // cancel
//                   toggleRevenueOptions(); // Close this popup
//                 }
//               }}
//             >
//               {btn.text}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* New popup: Month/Year Selection for "View Past Data" */}
//       {showViewPastDataPopup && (
//         <div
//           className="position-fixed top-50 start-50 translate-middle bg-white p-4 rounded shadow"
//           style={{ zIndex: 999, minWidth: '360px' }}
//         >
//           <h5 className="fw-bold mb-3 text-center">Select Month and Year to View Past Data</h5>
//           <div className="mb-3 text-center">
//             <DatePicker
//               selected={selectedDateViewPast}
//               onChange={(date) => setSelectedDateViewPast(date)}
//               dateFormat="MM/yyyy"
//               showMonthYearPicker
//               className="form-control text-center" // Apply Bootstrap styling
//               placeholderText="Select Month & Year"
//             />
//           </div>
//           <button className="btn btn-primary w-100 mb-2" onClick={handleViewPastData}>
//             Go
//           </button>
//           <button className="btn btn-outline-secondary w-100" onClick={() => setShowViewPastDataPopup(false)}>
//             Cancel
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from './DashboardCard';
import DashboardMetric from './DashboardMetric';
import DatePicker from 'react-datepicker';
import dashboardData from '../../data/dashboard.json';
// Remember to import 'react-datepicker/dist/react-datepicker.css' in App.js or index.js

const Dashboard = () => {
  const navigate = useNavigate();

  // UI state
  const [message, setMessage]                           = useState('');
  const [showMessageBox, setShowMessageBox]             = useState(false);
  const [showRevenueOptions, setShowRevenueOptions]     = useState(false);
  const [showViewPastDataPopup, setShowViewPastDataPopup] = useState(false);
  const [selectedDateViewPast, setSelectedDateViewPast]   = useState(null);

  // Destructure JSON data
  const {
    header,
    metrics,
    cards,
    accountOptions,
    revenuePopup,
    viewPastDataPopup,
    messageBox
  } = dashboardData;

  // Load Poppins font once
  useEffect(() => {
    const link = document.createElement('link');
    link.href  = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
    link.rel   = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Poppins', sans-serif";
  }, []);

  // Helpers
  const showMessage = (msg) => {
    setMessage(msg);
    setShowMessageBox(true);
  };
  const hideMessage = () => setShowMessageBox(false);
  const toggleRevenueOptions = () => setShowRevenueOptions(v => !v);

  // Card click logic
  const handleCardClick = (card) => {
    switch (card.title) {
      case 'Revenue Forecast':
        return toggleRevenueOptions();

      case 'Financial Management':
        const names = Object.keys(accountOptions);
        return showMessage(`Available Accounts: ${names.join(', ')}`);

      default:
        return showMessage(`Navigating to ${card.title}`);
    }
  };

  // View Past Data handler
  const handleViewPastData = () => {
    if (!selectedDateViewPast) {
      alert(viewPastDataPopup.alertMessage);
      return;
    }
    const month = selectedDateViewPast.getMonth() + 1;
    const year  = selectedDateViewPast.getFullYear();
    setShowViewPastDataPopup(false);
    navigate('/accounts', { state: { month, year } });
  };

  // Dark backdrop when any popup is open
  const isPopupOpen = showMessageBox || showRevenueOptions || showViewPastDataPopup;

  // DatePicker maxDate = last day of previous month
  const today                  = new Date();
  const lastDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  return (
    <div
      className="position-relative min-vh-100 d-flex justify-content-center align-items-center px-3"
      style={{
        background: 'radial-gradient(circle at center, #f8f9fa 60%, #e0e0e0 100%)',
        overflow:  'hidden'
      }}
    >
      {isPopupOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-25"
          style={{ backdropFilter: 'blur(3px)', zIndex: 1 }}
        />
      )}

      <div
        className="card rounded-4 shadow-lg w-100"
        style={{
          maxWidth:       '1100px',
          zIndex:         2,
          backgroundColor:'rgba(255,255,255,0.95)'
        }}
      >
        <div className="card-body">
          <h2 className="text-center fw-bold text-dark mb-2">
            {header.title}
          </h2>
          <p className="text-center text-muted mb-4">
            {header.subtitle}
          </p>

          {/* CARDS */}
          <div className="card bg-light border-0 shadow-sm p-4 mb-4 rounded-3">
            <div className="row g-4">
              {cards.map((card, i) => (
                <DashboardCard
                  key={i}
                  title={card.title}
                  description={card.description}
                  icon={card.icon}
                  onClick={() => handleCardClick(card)}
                />
              ))}
            </div>
          </div>

          {/* METRICS */}
          <div className="card bg-light border-0 shadow-sm p-4 rounded-3">
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
              {metrics.map((m, i) => (
                <DashboardMetric key={i} value={m.value} label={m.label} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGE POPUP */}
      {showMessageBox && (
        <div
          className="position-fixed top-50 start-50 translate-middle bg-dark text-white p-4 rounded shadow text-center"
          style={{ zIndex: 999 }}
        >
          <p className="mb-3">{message}</p>
          <button className="btn btn-light btn-sm" onClick={hideMessage}>
            {messageBox.closeText}
          </button>
        </div>
      )}

      {/* REVENUE OPTIONS POPUP */}
      {showRevenueOptions && (
        <div
          className="position-fixed top-50 start-50 translate-middle bg-white p-4 rounded shadow text-center"
          style={{ zIndex: 999 }}
        >
          <h5 className="fw-bold mb-3 text-dark">
            {revenuePopup.title}
          </h5>
          {revenuePopup.buttons.map((btn, i) => (
            <button
              key={i}
              className={`btn btn-outline-${btn.variant} w-100 mb-2`}
              onClick={() => {
                if (btn.action === 'upload') {
                  toggleRevenueOptions();
                  navigate('/upload');
                } else if (btn.action === 'viewPastData') {
                  toggleRevenueOptions();
                  setSelectedDateViewPast(null);
                  setShowViewPastDataPopup(true);
                } else {
                  toggleRevenueOptions();
                }
              }}
            >
              {btn.text}
            </button>
          ))}
        </div>
      )}

      {/* VIEW PAST DATA POPUP */}
      {showViewPastDataPopup && (
        <div
          className="position-fixed top-50 start-50 translate-middle bg-white p-4 rounded shadow"
          style={{ zIndex: 999, minWidth: '360px' }}
        >
          <h5 className="fw-bold mb-3 text-center">
            {viewPastDataPopup.title}
          </h5>
          <div className="mb-3 text-center">
            <DatePicker
              selected={selectedDateViewPast}
              onChange={(d) => setSelectedDateViewPast(d)}
              dateFormat={viewPastDataPopup.dateFormat}
              showMonthYearPicker
              maxDate={lastDayOfPreviousMonth}
              className="form-control text-center"
              placeholderText={viewPastDataPopup.placeholderText}
            />
          </div>
          <button
            className="btn btn-primary w-100 mb-2"
            onClick={handleViewPastData}
            disabled={!selectedDateViewPast}
          >
            {viewPastDataPopup.goButtonText}
          </button>
          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => setShowViewPastDataPopup(false)}
          >
            {viewPastDataPopup.cancelButtonText}
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;







































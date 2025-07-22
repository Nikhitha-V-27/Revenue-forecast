// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Breadcrumbs from '../Breadcrumbs'; // CORRECTED PATH: Breadcrumbs is one level up
// import accountData from '../../data/accountData.json'; // CORRECTED PATH: data is two levels up

// const AccountLevel = () => {
//   const navigate = useNavigate();

//   // Set font family on component mount
//   useEffect(() => {
//     const link = document.createElement('link');
//     link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
//     link.rel = 'stylesheet';
//     document.head.appendChild(link);
//     document.body.style.fontFamily = "'Poppins', sans-serif";
//   }, []);

//   // Define breadcrumb path for Account Level
//   const breadcrumbPath = [
//     { name: 'PMO Dashboard', page: '' },
//     { name: 'Revenue Forecast - Early View', page: 'upload' },
//     { name: 'Account Level', page: 'accounts' }
//   ];

//   return (
//     <div
//       className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"
//       style={{
//         background: 'linear-gradient(to bottom right, #f5f7fa, #e9ecef)',
//         fontFamily: "'Poppins', sans-serif"
//       }}
//     >
//       <div
//         className="card shadow p-4 p-md-5 w-100"
//         style={{ maxWidth: '1100px', backgroundColor: '#ffffffdd', borderRadius: '1rem' }}
//       >
//         <Breadcrumbs path={breadcrumbPath} />
//         <h2 className="text-center mb-4 fw-semibold text-dark">🏢 Account Level Overview</h2>

//         <div className="table-responsive rounded">
//           <table className="table table-hover align-middle table-borderless mb-0">
//             <thead
//               className="text-white"
//               style={{ background: 'linear-gradient(to right, #1d4ed8, #2563eb)' }}
//             >
//               <tr>
//                 <th className="px-3 py-2">Account ID</th>
//                 <th className="px-3 py-2">Account Name</th>
//                 <th className="px-3 py-2">Actual Revenue</th>
//                 <th className="px-3 py-2">Forecast Revenue</th>
//                 <th className="px-3 py-2">Forecast vs Actual Revenue</th>
//                 <th className="px-3 py-2 text-center">View</th>
//               </tr>
//             </thead>
//             <tbody>
//               {accountData.accounts.map((account) => {
//                 const variance = account.actualRevenue - account.forecastRevenue;
//                 return (
//                   <tr key={account.id} style={{ backgroundColor: '#fdfdfd' }}>
//                     <td className="px-3 py-2">{account.id}</td>
//                     <td className="px-3 py-2">{account.name}</td>
//                     <td className="px-3 py-2">${account.actualRevenue.toLocaleString()}</td>
//                     <td className="px-3 py-2">${account.forecastRevenue.toLocaleString()}</td>
//                     <td
//                       className={`px-3 py-2 fw-semibold ${
//                         variance > 0 ? 'text-success' : variance < 0 ? 'text-danger' : 'text-muted'
//                       }`}
//                     >
//                       ${variance.toLocaleString()}
//                     </td>
//                     <td className="px-3 py-2 text-center">
//                       <button
//                         onClick={() => navigate(`/accounts/${account.id}/projects`)} // Navigate to projects for this account
//                         className="btn btn-sm btn-outline-primary rounded-circle"
//                         title={`View Projects for ${account.name}`}
//                       >
//                         🔍
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AccountLevel;

//after demo after discussion for adding datatables.net

// import React, { useEffect, useState } from 'react';

// import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation

// import Breadcrumbs from '../Breadcrumbs'; // Corrected path as per your project structure

// const AccountLevel = () => {

//   const navigate = useNavigate();

//   const location = useLocation(); // Hook to access location state

//   // State to store fetched account data

//   const [accounts, setAccounts] = useState([]);

//   // State for loading indicator

//   const [loading, setLoading] = useState(true);

//   // State for error messages

//   const [error, setError] = useState(null);

//   // States to keep track of the month and year for which data was last fetched

//   // This helps in preventing unnecessary re-fetches and retaining context

//   const [activeMonth, setActiveMonth] = useState(null);

//   const [activeYear, setActiveYear] = useState(null);

//   // **IMPORTANT**: Ensure this matches your actual Spring Boot backend URL

//   const BACKEND_URL = 'http://localhost:8081';

//   // Set font family on component mount

//   useEffect(() => {

//     const link = document.createElement('link');

//     link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';

//     link.rel = 'stylesheet';

//     document.head.appendChild(link);

//     document.body.style.fontFamily = "'Poppins', sans-serif";

//   }, []);

//   // Effect to handle month/year state and fetch data

//   useEffect(() => {

//     const fetchAccountData = async (month, year) => {

//       setLoading(true);

//       setError(null);

//       // Construct the request body as expected by your backend

//       const requestBody = {

//         month: month,

//         year: year

//       };

//       console.log("Fetching account data with request body (POST):", requestBody); // For debugging

//       try {

//         const response = await fetch(`${BACKEND_URL}/api/account`, {

//           method: 'POST',

//           headers: {

//             'Content-Type': 'application/json', // Specify that we are sending JSON

//           },

//           body: JSON.stringify(requestBody), // Send the month and year in the body

//         });

//         if (!response.ok) {

//           const errorText = await response.text(); // Get detailed error message from backend

//           throw new Error(`HTTP error! status: ${response.status}, message: ${errorText || response.statusText}`);

//         }

//         const data = await response.json();

//         setAccounts(Array.isArray(data) ? data : [data].filter(Boolean));

//       } catch (err) {

//         console.error("Error fetching account data:", err);

//         setError(`Failed to load account data: ${err.message || "Network error"}`);

//       } finally {

//         setLoading(false);

//       }

//     };

//     // Logic to determine month and year for fetching

//     let monthToUse = location.state?.month;

//     let yearToUse = location.state?.year;

//     // If month/year are not in location.state (e.g., on back navigation), check sessionStorage

//     if (!monthToUse || !yearToUse) {

//       const storedMonth = sessionStorage.getItem('lastFetchedAccountMonth');

//       const storedYear = sessionStorage.getItem('lastFetchedAccountYear');

//       if (storedMonth && storedYear) {

//         monthToUse = parseInt(storedMonth, 10);

//         yearToUse = parseInt(storedYear, 10);

//       }

//     }

//     // If we have valid month/year, set active states and fetch data if needed

//     if (monthToUse && yearToUse) {

//       // Only fetch if the active month/year has changed or if accounts are empty

//       // This prevents re-fetching when simply navigating back to the same view

//       if (monthToUse !== activeMonth || yearToUse !== activeYear || accounts.length === 0) {

//         setActiveMonth(monthToUse);

//         setActiveYear(yearToUse);

//         sessionStorage.setItem('lastFetchedAccountMonth', monthToUse.toString());

//         sessionStorage.setItem('lastFetchedAccountYear', yearToUse.toString());

//         fetchAccountData(monthToUse, yearToUse);

//       } else {

//         // Data is already present for the active month/year, no need to fetch

//         setLoading(false);

//       }

//     } else {

//       // No month/year found in state or session, show error

//       setError("Missing month or year. Please go back and select a date.");

//       setLoading(false);

//     }

//   }, [location.state, BACKEND_URL, activeMonth, activeYear, accounts.length]); // Dependencies for useEffect

//   // Define breadcrumb path for Account Level

//   const breadcrumbPath = [

//     { name: 'PMO Dashboard', page: '' },

//     { name: 'Revenue Forecast - Early View', page: 'upload' },

//     { name: 'Account Level', page: 'accounts' }

//   ];

//   // Render loading state

//   if (loading) {

//     return (

//       <div className="min-vh-100 d-flex justify-content-center align-items-center">

//         <div className="spinner-border text-primary" role="status">

//           <span className="visually-hidden">Loading Account Data...</span>

//         </div>

//         <p className="ms-3 text-primary">Loading Account Data...</p>

//       </div>

//     );

//   }

//   // Render error state

//   if (error) {

//     return (

//       <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-danger">

//         <p className="fs-4">Error: {error}</p>

//         <button className="btn btn-primary mt-3" onClick={() => navigate('/upload')}>

//           Go to Upload Page

//         </button>

//       </div>

//     );

//   }

//   return (

//     <div

//       className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"

//       style={{

//         background: 'linear-gradient(to bottom right, #f5f7fa, #e9ecef)',

//         fontFamily: "'Poppins', sans-serif"

//       }}

//     >

//       <div

//         className="card shadow p-4 p-md-5 w-100"

//         style={{ maxWidth: '1100px', backgroundColor: '#ffffffdd', borderRadius: '1rem' }}

//       >

//         <Breadcrumbs path={breadcrumbPath} />

//         <h2 className="text-center mb-4 fw-semibold text-dark">🏢 Account Level Overview</h2>

//         <div className="table-responsive rounded">

//           <table className="table table-hover align-middle table-borderless mb-0">

//             <thead

//               className="text-white"

//               style={{ background: 'linear-gradient(to right, #1d4ed8, #2563eb)' }}

//             >

//               <tr>

//                 <th className="px-3 py-2">Account ID</th>

//                 <th className="px-3 py-2">Account Name</th>

//                 <th className="px-3 py-2">Total Projects</th>

//                 <th className="px-3 py-2">Total Revenue</th>

//                 <th className="px-3 py-2 text-center">View</th>

//               </tr>

//             </thead>

//             <tbody>

//               {accounts.length > 0 ? (

//                 accounts.map((account) => (

//                   <tr key={account.accountId} style={{ backgroundColor: '#fdfdfd' }}>

//                     <td className="px-3 py-2">{account.accountId}</td>

//                     <td className="px-3 py-2">{account.accountName}</td>

//                     <td className="px-3 py-2">{account.totalProjects}</td>

//                     <td className="px-3 py-2">${account.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>

//                     <td className="px-3 py-2 text-center">

//                       <button

//                         // Navigate to ProjectLevel, passing accountId, month, and year

//                         onClick={() => navigate(`/accounts/${account.accountId}/projects`, {

//                           state: {

//                             accountId: account.accountId, // Pass accountId explicitly

//                             month: activeMonth, // Pass the active month

//                             year: activeYear // Pass the active year

//                           }

//                         })}

//                         className="btn btn-sm btn-outline-primary rounded-circle"

//                         title={`View Projects for ${account.accountName}`}

//                       >

//                         🔍

//                       </button>

//                     </td>

//                   </tr>

//                 ))

//               ) : (

//                 <tr>

//                   <td colSpan="5" className="text-center text-muted py-4">

//                     No account data found for the selected period.

//                   </td>

//                 </tr>

//               )}

//             </tbody>

//           </table>

//         </div>

//       </div>

//     </div>

//   );

// };

// export default AccountLevel;


// import React, { useEffect, useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
// import Breadcrumbs from '../Breadcrumbs'; // Corrected path as per your project structure
// // Import your commonData.json
// import commonData from '../../data/commonData.json';

// const AccountLevel = () => {
//   const navigate = useNavigate();
//   const location = useLocation(); // Hook to access location state

//   // State to store fetched account data
//   const [accounts, setAccounts] = useState([]);
//   // State for loading indicator
//   const [loading, setLoading] = useState(true);
//   // State for error messages
//   const [error, setError] = useState(null);
//   // States to keep track of the month and year for which data was last fetched
//   // This helps in preventing unnecessary re-fetches and retaining context
//   const [activeMonth, setActiveMonth] = useState(null);
//   const [activeYear, setActiveYear] = useState(null);

//   // **IMPORTANT**: Ensure this matches your actual Spring Boot backend URL
//   const BACKEND_URL = 'http://localhost:8081';

//   // Destructure your currency settings from commonData.json
//   const {
//     locale,
//     currency,
//     minimumFractionDigits,
//     maximumFractionDigits
//   } = commonData.currencySettings;

//   // Utility to format any number to your centralized currency format
//   const formatCurrency = (value = 0) =>
//     value.toLocaleString(locale, {
//       style: 'currency',
//       currency,
//       minimumFractionDigits,
//       maximumFractionDigits
//     });


//   // Set font family on component mount
//   useEffect(() => {
//     const link = document.createElement('link');
//     link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
//     link.rel = 'stylesheet';
//     document.head.appendChild(link);
//     document.body.style.fontFamily = "'Poppins', sans-serif";
//   }, []);

//   // Effect to handle month/year state and fetch data
//   useEffect(() => {
//     const fetchAccountData = async (month, year) => {
//       setLoading(true);
//       setError(null);
//       // Construct the request body as expected by your backend
//       const requestBody = {
//         month: month,
//         year: year
//       };
//       console.log("Fetching account data with request body (POST):", requestBody); // For debugging
//       try {
//         const response = await fetch(`${BACKEND_URL}/api/account`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json', // Specify that we are sending JSON
//           },
//           body: JSON.stringify(requestBody), // Send the month and year in the body
//         });
//         if (!response.ok) {
//           const errorText = await response.text(); // Get detailed error message from backend
//           throw new Error(`HTTP error! status: ${response.status}, message: ${errorText || response.statusText}`);
//         }
//         const data = await response.json();
//         setAccounts(Array.isArray(data) ? data : [data].filter(Boolean));
//       } catch (err) {
//         console.error("Error fetching account data:", err);
//         setError(`Failed to load account data: ${err.message || "Network error"}`);
//       } finally {
//         setLoading(false);
//       }
//     };
//     // Logic to determine month and year for fetching
//     let monthToUse = location.state?.month;
//     let yearToUse = location.state?.year;
//     // If month/year are not in location.state (e.g., on back navigation), check sessionStorage
//     if (!monthToUse || !yearToUse) {
//       const storedMonth = sessionStorage.getItem('lastFetchedAccountMonth');
//       const storedYear = sessionStorage.getItem('lastFetchedAccountYear');
//       if (storedMonth && storedYear) {
//         monthToUse = parseInt(storedMonth, 10);
//         yearToUse = parseInt(storedYear, 10);
//       }
//     }
//     // If we have valid month/year, set active states and fetch data if needed
//     if (monthToUse && yearToUse) {
//       // Only fetch if the active month/year has changed or if accounts are empty
//       // This prevents re-fetching when simply navigating back to the same view
//       if (monthToUse !== activeMonth || yearToUse !== activeYear || accounts.length === 0) {
//         setActiveMonth(monthToUse);
//         setActiveYear(yearToUse);
//         sessionStorage.setItem('lastFetchedAccountMonth', monthToUse.toString());
//         sessionStorage.setItem('lastFetchedAccountYear', yearToUse.toString());
//         fetchAccountData(monthToUse, yearToUse);
//       } else {
//         // Data is already present for the active month/year, no need to fetch
//         setLoading(false);
//       }
//     } else {
//       // No month/year found in state or session, show error
//       setError("Missing month or year. Please go back and select a date.");
//       setLoading(false);
//     }
//   }, [location.state, BACKEND_URL, activeMonth, activeYear, accounts.length]); // Dependencies for useEffect

//   // Define breadcrumb path for Account Level
//   const breadcrumbPath = [
//     { name: 'PMO Dashboard', page: '' },
//     { name: 'Revenue Forecast - Early View', page: 'upload' },
//     { name: 'Account Level', page: 'accounts' }
//   ];

//   // Render loading state
//   if (loading) {
//     return (
//       <div className="min-vh-100 d-flex justify-content-center align-items-center">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading Account Data...</span>
//         </div>
//         <p className="ms-3 text-primary">Loading Account Data...</p>
//       </div>
//     );
//   }

//   // Render error state
//   if (error) {
//     return (
//       <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-danger">
//         <p className="fs-4">Error: {error}</p>
//         <button className="btn btn-primary mt-3" onClick={() => navigate('/upload')}>
//           Go to Upload Page
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"
//       style={{
//         background: 'linear-gradient(to bottom right, #f5f7fa, #e9ecef)',
//         fontFamily: "'Poppins', sans-serif"
//       }}
//     >
//       <div
//         className="card shadow p-4 p-md-5 w-100"
//         style={{ maxWidth: '1100px', backgroundColor: '#ffffffdd', borderRadius: '1rem' }}
//       >
//         <Breadcrumbs path={breadcrumbPath} />
//         <h2 className="text-center mb-4 fw-semibold text-dark">🏢 Account Level Overview</h2>
//         <div className="table-responsive rounded">
//           <table className="table table-hover align-middle table-borderless mb-0">
//             <thead
//               className="text-white"
//               style={{ background: 'linear-gradient(to right, #1d4ed8, #2563eb)' }}
//             >
//               <tr>
//                 <th className="px-3 py-2">Account ID</th>
//                 <th className="px-3 py-2">Account Name</th>
//                 <th className="px-3 py-2">Total Projects</th>
//                 <th className="px-3 py-2">Total Revenue</th>
//                 <th className="px-3 py-2 text-center">View</th>
//               </tr>
//             </thead>
//             <tbody>
//               {accounts.length > 0 ? (
//                 accounts.map((account) => (
//                   <tr key={account.accountId} style={{ backgroundColor: '#fdfdfd' }}>
//                     <td className="px-3 py-2">{account.accountId}</td>
//                     <td className="px-3 py-2">{account.accountName}</td>
//                     <td className="px-3 py-2">{account.totalProjects}</td>
//                     {/* Apply the formatCurrency function here */}
//                     <td className="px-3 py-2">{formatCurrency(account.totalRevenue)}</td>
//                     <td className="px-3 py-2 text-center">
//                       <button
//                         // Navigate to ProjectLevel, passing accountId, month, and year
//                         onClick={() => navigate(`/accounts/${account.accountId}/projects`, {
//                           state: {
//                             accountId: account.accountId, // Pass accountId explicitly
//                             month: activeMonth, // Pass the active month
//                             year: activeYear, // Pass the active year
//                             accountName: account.accountName // Also pass account name for breadcrumbs in ProjectLevel
//                           }
//                         })}
//                         className="btn btn-sm btn-outline-primary rounded-circle"
//                         title={`View Projects for ${account.accountName}`}
//                       >
//                         🔍
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="5" className="text-center text-muted py-4">
//                     No account data found for the selected period.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AccountLevel;

// import React, { useEffect, useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import Breadcrumbs from '../Breadcrumbs';
// import commonData from '../../data/commonData.json';

// const AccountLevel = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [accounts, setAccounts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeMonth, setActiveMonth] = useState(null);
//   const [activeYear, setActiveYear] = useState(null);

//   const BACKEND_URL = 'http://localhost:8081';

//   const {
//     locale,
//     currency,
//     minimumFractionDigits,
//     maximumFractionDigits
//   } = commonData.currencySettings;

//   const formatCurrency = (value = 0) =>
//     value.toLocaleString(locale, {
//       style: 'currency',
//       currency,
//       minimumFractionDigits,
//       maximumFractionDigits
//     });

//   // Placeholder function for Download Data
//   const handleDownloadData = () => {
//     alert('Download Data button clicked! (Logic not yet implemented)');
//     // Your actual CSV generation and download logic will go here later.
//   };

//   useEffect(() => {
//     const link = document.createElement('link');
//     link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
//     link.rel = 'stylesheet';
//     document.head.appendChild(link);
//     document.body.style.fontFamily = "'Poppins', sans-serif";
//   }, []);

//   useEffect(() => {
//     const fetchAccountData = async (month, year) => {
//       setLoading(true);
//       setError(null);
//       const requestBody = {
//         month: month,
//         year: year
//       };
//       console.log("Fetching account data with request body (POST):", requestBody);
//       try {
//         const response = await fetch(`${BACKEND_URL}/api/account`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(requestBody),
//         });
//         if (!response.ok) {
//           const errorText = await response.text();
//           throw new Error(`HTTP error! status: ${response.status}, message: ${errorText || response.statusText}`);
//         }
//         const data = await response.json();
//         setAccounts(Array.isArray(data) ? data : [data].filter(Boolean));
//       } catch (err) {
//         console.error("Error fetching account data:", err);
//         setError(`Failed to load account data: ${err.message || "Network error"}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     let monthToUse = location.state?.month;
//     let yearToUse = location.state?.year;

//     if (!monthToUse || !yearToUse) {
//       const storedMonth = sessionStorage.getItem('lastFetchedAccountMonth');
//       const storedYear = sessionStorage.getItem('lastFetchedAccountYear');
//       if (storedMonth && storedYear) {
//         monthToUse = parseInt(storedMonth, 10);
//         yearToUse = parseInt(storedYear, 10);
//       }
//     }

//     if (monthToUse && yearToUse) {
//       if (monthToUse !== activeMonth || yearToUse !== activeYear || accounts.length === 0) {
//         setActiveMonth(monthToUse);
//         setActiveYear(yearToUse);
//         sessionStorage.setItem('lastFetchedAccountMonth', monthToUse.toString());
//         sessionStorage.setItem('lastFetchedAccountYear', yearToUse.toString());
//         fetchAccountData(monthToUse, yearToUse);
//       } else {
//         setLoading(false);
//       }
//     } else {
//       setError("Missing month or year. Please go back and select a date.");
//       setLoading(false);
//     }
//   }, [location.state, BACKEND_URL, activeMonth, activeYear, accounts.length]);

//   const breadcrumbPath = [
//     { name: 'PMO Dashboard', page: '' },
//     { name: 'Revenue Forecast - Early View', page: 'upload' },
//     { name: 'Account Level', page: 'accounts' }
//   ];

//   if (loading) {
//     return (
//       <div className="min-vh-100 d-flex justify-content-center align-items-center">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading Account Data...</span>
//         </div>
//         <p className="ms-3 text-primary">Loading Account Data...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-danger">
//         <p className="fs-4">Error: {error}</p>
//         <button className="btn btn-primary mt-3" onClick={() => navigate('/upload')}>
//           Go to Upload Page
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"
//       style={{
//         background: 'linear-gradient(to bottom right, #f5f7fa, #e9ecef)',
//         fontFamily: "'Poppins', sans-serif"
//       }}
//     >
//       <div
//         className="card shadow p-4 p-md-5 w-100"
//         style={{ maxWidth: '1100px', backgroundColor: '#ffffffdd', borderRadius: '1rem' }}
//       >
//         <Breadcrumbs path={breadcrumbPath} />
//         <div className="d-flex justify-content-between align-items-center mb-4">
//           <h2 className="mb-0 fw-semibold text-dark">🏢 Account Level Overview</h2>
//           {/* Only the Download Data button is here now */}
//           {accounts.length > 0 && ( // Conditionally render if there's data
//             <div className="d-flex gap-2">
//               <button
//                 className="btn btn-outline-success rounded-pill px-3"
//                 onClick={handleDownloadData}
//                 title="Download Account Data"
//               >
//                 <i className="bi bi-download me-2"></i> Download Data
//               </button>
//             </div>
//           )}
//         </div>
//         <div className="table-responsive rounded">
//           <table className="table table-hover align-middle table-borderless mb-0">
//             <thead
//               className="text-white"
//               style={{ background: 'linear-gradient(to right, #1d4ed8, #2563eb)' }}
//             >
//               <tr>
//                 <th className="px-3 py-2">Account ID</th>
//                 <th className="px-3 py-2">Account Name</th>
//                 <th className="px-3 py-2">Total Projects</th>
//                 <th className="px-3 py-2">Total Revenue</th>
//                 <th className="px-3 py-2 text-center">View</th>
//               </tr>
//             </thead>
//             <tbody>
//               {accounts.length > 0 ? (
//                 accounts.map((account) => (
//                   <tr key={account.accountId} style={{ backgroundColor: '#fdfdfd' }}>
//                     <td className="px-3 py-2">{account.accountId}</td>
//                     <td className="px-3 py-2">{account.accountName}</td>
//                     <td className="px-3 py-2">{account.totalProjects}</td>
//                     <td className="px-3 py-2">{formatCurrency(account.totalRevenue)}</td>
//                     <td className="px-3 py-2 text-center">
//                       <button
//                         onClick={() => navigate(`/accounts/${account.accountId}/projects`, {
//                           state: {
//                             accountId: account.accountId,
//                             month: activeMonth,
//                             year: activeYear,
//                             accountName: account.accountName
//                           }
//                         })}
//                         className="btn btn-sm btn-outline-primary rounded-circle"
//                         title={`View Projects for ${account.accountName}`}
//                       >
//                         🔍
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="5" className="text-center text-muted py-4">
//                     No account data found for the selected period.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AccountLevel;


// import React, { useEffect, useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import Breadcrumbs from '../Breadcrumbs';
// import commonData from '../../data/commonData.json';

// const AccountLevel = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [accounts, setAccounts] = useState([]);
//   const [commentsMap, setCommentsMap] = useState({});
//   const [modalVisible, setModalVisible] = useState(false);
//   const [currentAccountId, setCurrentAccountId] = useState(null);
//   const [commentInput, setCommentInput] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeMonth, setActiveMonth] = useState(null);
//   const [activeYear, setActiveYear] = useState(null);

//   const BACKEND_URL = 'http://localhost:8081';

//   // Destructure currency settings from commonData.json
//   const {
//     locale,
//     currency,
//     minimumFractionDigits,
//     maximumFractionDigits
//   } = commonData.currencySettings;

//   // Centralized currency formatter
//   const formatCurrency = (value = 0) =>
//     value.toLocaleString(locale, {
//       style: 'currency',
//       currency,
//       minimumFractionDigits,
//       maximumFractionDigits
//     });

//   // Load Poppins font on mount
//   useEffect(() => {
//     const link = document.createElement('link');
//     link.href =
//       'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
//     link.rel = 'stylesheet';
//     document.head.appendChild(link);
//     document.body.style.fontFamily = "'Poppins', sans-serif";
//   }, []);

//   // Fetch account data when month/year change
//   useEffect(() => {
//     const fetchAccountData = async (month, year) => {
//       setLoading(true);
//       setError(null);
//       try {
//         const resp = await fetch(`${BACKEND_URL}/api/account`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ month, year })
//         });
//         if (!resp.ok) {
//           const msg = await resp.text();
//           throw new Error(`status: ${resp.status}, message: ${msg || resp.statusText}`);
//         }
//         const data = await resp.json();
//         setAccounts(Array.isArray(data) ? data : [data].filter(Boolean));
//       } catch (e) {
//         console.error(e);
//         setError(`Failed to load account data: ${e.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     let monthToUse = location.state?.month;
//     let yearToUse = location.state?.year;

//     if (!monthToUse || !yearToUse) {
//       const m = sessionStorage.getItem('lastFetchedAccountMonth');
//       const y = sessionStorage.getItem('lastFetchedAccountYear');
//       if (m && y) {
//         monthToUse = parseInt(m, 10);
//         yearToUse = parseInt(y, 10);
//       }
//     }

//     if (monthToUse && yearToUse) {
//       if (
//         monthToUse !== activeMonth ||
//         yearToUse !== activeYear ||
//         accounts.length === 0
//       ) {
//         setActiveMonth(monthToUse);
//         setActiveYear(yearToUse);
//         sessionStorage.setItem('lastFetchedAccountMonth', monthToUse.toString());
//         sessionStorage.setItem('lastFetchedAccountYear', yearToUse.toString());
//         fetchAccountData(monthToUse, yearToUse);
//       } else {
//         setLoading(false);
//       }
//     } else {
//       setError('Missing month or year. Please go back and select a date.');
//       setLoading(false);
//     }
//   }, [location.state, BACKEND_URL, activeMonth, activeYear, accounts.length]);

//   const breadcrumbPath = [
//     { name: 'PMO Dashboard', page: '' },
//     { name: 'Revenue Forecast - Early View', page: 'upload' },
//     { name: 'Account Level', page: 'accounts' }
//   ];

//   const openCommentModal = (accountId) => {
//     setCurrentAccountId(accountId);
//     setCommentInput(commentsMap[accountId] || '');
//     setModalVisible(true);
//   };

//   const saveComment = () => {
//     setCommentsMap(prev => ({
//       ...prev,
//       [currentAccountId]: commentInput
//     }));
//     setModalVisible(false);
//   };

//   const closeModal = () => {
//     setModalVisible(false);
//     setCommentInput('');
//     setCurrentAccountId(null);
//   };

//   return (
//     <div
//       className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"
//       style={{
//         background: 'linear-gradient(to bottom right, #f5f7fa, #e9ecef)',
//         fontFamily: "'Poppins', sans-serif"
//       }}
//     >
//       <div
//         className="card shadow p-4 p-md-5 w-100"
//         style={{
//           maxWidth: '1100px',
//           backgroundColor: '#ffffffdd',
//           borderRadius: '1rem'
//         }}
//       >
//         <Breadcrumbs path={breadcrumbPath} />
//         <h2 className="text-center mb-4 fw-semibold text-dark">
//           🏢 Account Level Overview
//         </h2>

//         {loading ? (
//           <div className="d-flex justify-content-center align-items-center">
//             <div className="spinner-border text-primary" role="status" />
//             <p className="ms-3 text-primary">Loading Account Data...</p>
//           </div>
//         ) : error ? (
//           <div className="d-flex flex-column justify-content-center align-items-center text-danger">
//             <p className="fs-4">Error: {error}</p>
//             <button className="btn btn-primary mt-3" onClick={() => navigate('/upload')}>
//               Go to Upload Page
//             </button>
//           </div>
//         ) : (
//           <div className="table-responsive rounded">
//             <table className="table table-hover align-middle table-borderless mb-0">
//               <thead
//                 className="text-white"
//                 style={{ background: 'linear-gradient(to right, #1d4ed8, #2563eb)' }}
//               >
//                 <tr>
//                   <th className="px-3 py-2">Account ID</th>
//                   <th className="px-3 py-2">Account Name</th>
//                   <th className="px-3 py-2">Total Projects</th>
//                   <th className="px-3 py-2">Total Revenue</th>
//                   <th className="px-3 py-2">Forecast Revenue</th>
//                   <th className="px-3 py-2">Revenue Difference</th>
//                   <th className="px-3 py-2 text-center">Comment</th>
//                   <th className="px-3 py-2 text-center">View</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {accounts.length > 0 ? accounts.map(account => {
//                   const actual = account.totalRevenue || 0;
//                   const forecast = 0;
//                   const difference = 0;
//                   return (
//                     <tr key={account.accountId} style={{ backgroundColor: '#fdfdfd' }}>
//                       <td className="px-3 py-2">{account.accountId}</td>
//                       <td className="px-3 py-2">{account.accountName}</td>
//                       <td className="px-3 py-2">{account.totalProjects}</td>
//                       <td className="px-3 py-2">{formatCurrency(actual)}</td>
//                       <td className="px-3 py-2">{formatCurrency(forecast)}</td>
//                       <td className="px-3 py-2">{formatCurrency(difference)}</td>
//                       <td className="px-3 py-2 text-center">
//                         <button
//                           className="btn btn-sm btn-outline-secondary"
//                           onClick={() => openCommentModal(account.accountId)}
//                           title="Add/Edit comment"
//                         >
//                           💬
//                         </button>
//                       </td>
//                       <td className="px-3 py-2 text-center">
//                         <button
//                           className="btn btn-sm btn-outline-primary rounded-circle"
//                           onClick={() =>
//                             navigate(
//                               `/accounts/${account.accountId}/projects`,
//                               { state: { accountId: account.accountId, month: activeMonth, year: activeYear } }
//                             )
//                           }
//                           title={`View Projects for ${account.accountName}`}
//                         >
//                           🔍
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 }) : (
//                   <tr>
//                     <td colSpan="8" className="text-center text-muted py-4">
//                       No account data found for the selected period.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {modalVisible && (
//         <div className="modal fade show d-block" style={{ backgroundColor: '#00000066' }}>
//           <div className="modal-dialog modal-dialog-centered">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">💬 Comment</h5>
//                 <button type="button" className="btn-close" onClick={closeModal} />
//               </div>
//               <div className="modal-body">
//                 <textarea
//                   className="form-control"
//                   rows="4"
//                   placeholder="Enter your comment here..."
//                   value={commentInput}
//                   onChange={e => setCommentInput(e.target.value)}
//                 />
//               </div>
//               <div className="modal-footer">
//                 <button className="btn btn-secondary" onClick={closeModal}>
//                   Cancel
//                 </button>
//                 <button className="btn btn-primary" onClick={saveComment}>
//                   Save
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AccountLevel;

// src/components/Details/AccountLevel.js

// import React, { useRef, useEffect, useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import $ from 'jquery';
// import 'datatables.net';
// import 'datatables.net-dt/css/dataTables.dataTables.min.css';
// import Breadcrumbs from '../Breadcrumbs';
// import commonData from '../../data/commonData.json';

// const AccountLevel = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const tableRef = useRef(null);

//   const [accounts, setAccounts]             = useState([]);
//   const [commentsMap, setCommentsMap]       = useState({});
//   const [modalVisible, setModalVisible]     = useState(false);
//   const [currentAccountId, setCurrentAccountId] = useState(null);
//   const [commentInput, setCommentInput]     = useState('');
//   const [loading, setLoading]               = useState(true);
//   const [error, setError]                   = useState(null);
//   const [activeMonth, setActiveMonth]       = useState(null);
//   const [activeYear, setActiveYear]         = useState(null);

//   const BACKEND_URL = 'http://localhost:8081';

//   // Currency settings
//   const {
//     locale,
//     currency,
//     minimumFractionDigits,
//     maximumFractionDigits
//   } = commonData.currencySettings;

//   const formatCurrency = (value = 0) =>
//     value.toLocaleString(locale, {
//       style: 'currency',
//       currency,
//       minimumFractionDigits,
//       maximumFractionDigits
//     });

//   // Load Poppins font
//   useEffect(() => {
//     const link = document.createElement('link');
//     link.href =
//       'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
//     link.rel = 'stylesheet';
//     document.head.appendChild(link);
//     document.body.style.fontFamily = "'Poppins', sans-serif";
//   }, []);

//   // Fetch data based on month/year
//   useEffect(() => {
//     const fetchAccountData = async (month, year) => {
//       setLoading(true);
//       setError(null);
//       try {
//         const resp = await fetch(`${BACKEND_URL}/api/account`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ month, year })
//         });
//         if (!resp.ok) {
//           const msg = await resp.text();
//           throw new Error(`status: ${resp.status}, message: ${msg || resp.statusText}`);
//         }
//         const data = await resp.json();
//         setAccounts(Array.isArray(data) ? data : [data].filter(Boolean));
//       } catch (e) {
//         console.error(e);
//         setError(`Failed to load account data: ${e.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     let month = location.state?.month;
//     let year  = location.state?.year;

//     if (!month || !year) {
//       const sm = sessionStorage.getItem('lastFetchedAccountMonth');
//       const sy = sessionStorage.getItem('lastFetchedAccountYear');
//       if (sm && sy) {
//         month = parseInt(sm, 10);
//         year  = parseInt(sy, 10);
//       }
//     }

//     if (month && year) {
//       if (
//         month !== activeMonth ||
//         year  !== activeYear ||
//         accounts.length === 0
//       ) {
//         setActiveMonth(month);
//         setActiveYear(year);
//         sessionStorage.setItem('lastFetchedAccountMonth', month.toString());
//         sessionStorage.setItem('lastFetchedAccountYear', year.toString());
//         fetchAccountData(month, year);
//       } else {
//         setLoading(false);
//       }
//     } else {
//       setError('Missing month or year. Please go back and select a date.');
//       setLoading(false);
//     }
//   }, [location.state, activeMonth, activeYear, accounts.length]);

//   // Initialize and destroy DataTable
//   useEffect(() => {
//     if (!loading && accounts.length > 0 && tableRef.current) {
//       const $tbl = $(tableRef.current);
//       if ($.fn.DataTable.isDataTable($tbl)) {
//         $tbl.DataTable().destroy();
//       }
//       $tbl.DataTable({
//         paging:    true,
//         searching: true,
//         ordering:  true,
//         info:      true,
//         autoWidth: false
//       });
//     }
//     return () => {
//       if (tableRef.current) {
//         const $tbl = $(tableRef.current);
//         if ($.fn.DataTable.isDataTable($tbl)) {
//           $tbl.DataTable().destroy();
//         }
//       }
//     };
//   }, [loading, accounts]);

//   const breadcrumbPath = [
//     { name: 'PMO Dashboard', page: '' },
//     { name: 'Revenue Forecast - Early View', page: 'upload' },
//     { name: 'Account Level', page: 'accounts' }
//   ];

//   const openCommentModal = (accountId) => {
//     setCurrentAccountId(accountId);
//     setCommentInput(commentsMap[accountId] || '');
//     setModalVisible(true);
//   };

//   const saveComment = () => {
//     setCommentsMap(prev => ({
//       ...prev,
//       [currentAccountId]: commentInput
//     }));
//     setModalVisible(false);
//   };

//   const closeModal = () => {
//     setModalVisible(false);
//     setCommentInput('');
//     setCurrentAccountId(null);
//   };

//   return (
//     <div
//       className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"
//       style={{
//         background: 'linear-gradient(to bottom right, #f5f7fa, #e9ecef)',
//         fontFamily: "'Poppins', sans-serif"
//       }}
//     >
//       <div
//         className="card shadow p-4 p-md-5 w-100"
//         style={{
//           maxWidth: '1100px',
//           backgroundColor: '#ffffffdd',
//           borderRadius: '1rem'
//         }}
//       >
//         <Breadcrumbs path={breadcrumbPath} />
//         <h2 className="text-center mb-4 fw-semibold text-dark">
//           🏢 Account Level Overview
//         </h2>

//         {loading ? (
//           <div className="d-flex justify-content-center align-items-center">
//             <div className="spinner-border text-primary" role="status" />
//             <p className="ms-3 text-primary">Loading Account Data...</p>
//           </div>
//         ) : error ? (
//           <div className="d-flex flex-column justify-content-center align-items-center text-danger">
//             <p className="fs-4">Error: {error}</p>
//             <button
//               className="btn btn-primary mt-3"
//               onClick={() => navigate('/upload')}
//             >
//               Go to Upload Page
//             </button>
//           </div>
//         ) : (
//           <div className="table-responsive rounded">
//             <table
//               ref={tableRef}
//               className="display table table-hover align-middle table-bordered mb-0"
//               style={{ width: '100%' }}
//             >
//               <thead
//                 className="text-white"
//                 style={{ background: 'linear-gradient(to right, #1d4ed8, #2563eb)' }}
//               >
//                 <tr>
//                   <th className="px-3 py-2">Account ID</th>
//                   <th className="px-3 py-2">Account Name</th>
//                   <th className="px-3 py-2">Total Projects</th>
//                   <th className="px-3 py-2">Total Revenue</th>
//                   <th className="px-3 py-2">Forecast Revenue</th>
//                   <th className="px-3 py-2">Revenue Difference</th>
//                   <th className="px-3 py-2 text-center">Comment</th>
//                   <th className="px-3 py-2 text-center">View</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {accounts.length > 0 ? (
//                   accounts.map(acc => (
//                     <tr key={acc.accountId}>
//                       <td>{acc.accountId}</td>
//                       <td>{acc.accountName}</td>
//                       <td>{acc.totalProjects}</td>
//                       <td>{formatCurrency(acc.totalRevenue)}</td>
//                       <td>{formatCurrency(0)}</td>
//                       <td>{formatCurrency(0)}</td>
//                       <td className="text-center">
//                         <button
//                           className="btn btn-sm btn-outline-secondary"
//                           onClick={() => openCommentModal(acc.accountId)}
//                         >
//                           💬
//                         </button>
//                       </td>
//                       <td className="text-center">
//                         <button
//                           className="btn btn-sm btn-outline-primary rounded-circle"
//                           onClick={() =>
//                             navigate(`/accounts/${acc.accountId}/projects`, {
//                               state: { accountId: acc.accountId, month: activeMonth, year: activeYear }
//                             })
//                           }
//                         >
//                           🔍
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="8" className="text-center text-muted py-4">
//                       No account data found for the selected period.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {modalVisible && (
//         <div className="modal fade show d-block" style={{ backgroundColor: '#00000066' }}>
//           <div className="modal-dialog modal-dialog-centered">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">💬 Comment</h5>
//                 <button type="button" className="btn-close" onClick={closeModal} />
//               </div>
//               <div className="modal-body">
//                 <textarea
//                   className="form-control"
//                   rows="4"
//                   placeholder="Enter your comment here..."
//                   value={commentInput}
//                   onChange={e => setCommentInput(e.target.value)}
//                 />
//               </div>
//               <div className="modal-footer">
//                 <button className="btn btn-secondary" onClick={closeModal}>
//                   Cancel
//                 </button>
//                 <button className="btn btn-primary" onClick={saveComment}>
//                   Save
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AccountLevel;

// src/components/Details/AccountLevel.js

// import React, { useRef, useEffect, useState } from 'react';
// import { useNavigate, useLocation }           from 'react-router-dom';
// import $                                      from 'jquery';
// import 'datatables.net';
// import 'datatables.net-dt/css/dataTables.dataTables.min.css';
// import Breadcrumbs                            from '../Breadcrumbs';
// import commonData                             from '../../data/commonData.json';

// const AccountLevel = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const tableRef = useRef(null);

//   // UI state
//   const [accounts, setAccounts]             = useState([]);
//   const [commentsMap, setCommentsMap]       = useState({});  // { accId: comment }
//   const [modalVisible, setModalVisible]     = useState(false);
//   const [currentAccountId, setCurrentAccountId] = useState(null);
//   const [commentInput, setCommentInput]     = useState('');
//   const [loading, setLoading]               = useState(true);
//   const [error, setError]                   = useState(null);
//   const [activeMonth, setActiveMonth]       = useState(null);
//   const [activeYear, setActiveYear]         = useState(null);

//   const BACKEND_URL = 'http://localhost:8081';

//   // Currency formatter
//   const {
//     locale,
//     currency,
//     minimumFractionDigits,
//     maximumFractionDigits
//   } = commonData.currencySettings;
//   const formatCurrency = (v = 0) =>
//     v.toLocaleString(locale, {
//       style: 'currency',
//       currency,
//       minimumFractionDigits,
//       maximumFractionDigits
//     });

//   // Poppins font
//   useEffect(() => {
//     const link = document.createElement('link');
//     link.href =
//       'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
//     link.rel = 'stylesheet';
//     document.head.appendChild(link);
//     document.body.style.fontFamily = "'Poppins', sans-serif";
//   }, []);

//   // 1) Fetch account rows
//   useEffect(() => {
//     const fetchAccountData = async (month, year) => {
//       setLoading(true);
//       setError(null);
//       try {
//         const resp = await fetch(`${BACKEND_URL}/api/account`, {
//           method:  'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body:    JSON.stringify({ month, year })
//         });
//         if (!resp.ok) {
//           const txt = await resp.text();
//           throw new Error(txt || resp.statusText);
//         }
//         const data = await resp.json();
//         setAccounts(Array.isArray(data) ? data : [data].filter(Boolean));
//       } catch (e) {
//         console.error(e);
//         setError(`Failed to load accounts: ${e.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     let m = location.state?.month;
//     let y = location.state?.year;
//     if (!m || !y) {
//       const sm = sessionStorage.getItem('lastFetchedAccountMonth');
//       const sy = sessionStorage.getItem('lastFetchedAccountYear');
//       if (sm && sy) {
//         m = +sm;
//         y = +sy;
//       }
//     }

//     if (m && y) {
//       if (m !== activeMonth || y !== activeYear || accounts.length === 0) {
//         setActiveMonth(m);
//         setActiveYear(y);
//         sessionStorage.setItem('lastFetchedAccountMonth', m);
//         sessionStorage.setItem('lastFetchedAccountYear', y);
//         fetchAccountData(m, y);
//       }
//     } else {
//       setError('Missing month or year. Please go back.');
//       setLoading(false);
//     }
//   }, [location.state, activeMonth, activeYear, accounts.length]);

//   // 2) Once accounts + period are known, fetch existing comments
//   useEffect(() => {
//     if (activeMonth && activeYear && accounts.length > 0) {
//       const fetchComments = async () => {
//         try {
//           const resp = await fetch(
//             `${BACKEND_URL}/api/account/comment?month=${activeMonth}&year=${activeYear}`
//           );
//           if (!resp.ok) {
//             throw new Error(await resp.text());
//           }
//           const list = await resp.json();
//           // list is Array<AccountCommentDto>
//           const map = {};
//           list.forEach((dto) => {
//             map[dto.accId] = dto.comment;
//           });
//           setCommentsMap(map);
//         } catch (e) {
//           console.warn('Could not load comments:', e);
//         }
//       };
//       fetchComments();
//     }
//   }, [activeMonth, activeYear, accounts]);

//   // 3) DataTables init/destroy
//   useEffect(() => {
//     if (!loading && accounts.length > 0 && tableRef.current) {
//       const $tbl = $(tableRef.current);
//       if ($.fn.DataTable.isDataTable($tbl)) {
//         $tbl.DataTable().destroy();
//       }
//       $tbl.DataTable({ paging: true, searching: true, ordering: true });
//     }
//     return () => {
//       if (tableRef.current) {
//         const $tbl = $(tableRef.current);
//         if ($.fn.DataTable.isDataTable($tbl)) {
//           $tbl.DataTable().destroy();
//         }
//       }
//     };
//   }, [loading, accounts]);

//   // Open the comment modal for a given account
//   const openCommentModal = (accId) => {
//     setCurrentAccountId(accId);
//     setCommentInput(commentsMap[accId] || '');
//     setModalVisible(true);
//   };

//   // Save comment to backend
//   const saveComment = async () => {
//     try {
//       const dto = {
//         accId:  currentAccountId,
//         month:  activeMonth,
//         year:   activeYear,
//         comment: commentInput
//       };
//       const resp = await fetch(`${BACKEND_URL}/api/account/comment`, {
//         method:  'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body:    JSON.stringify(dto)
//       });
//       if (!resp.ok) {
//         throw new Error(await resp.text());
//       }
//       // update local map immediately
//       setCommentsMap((m) => ({ ...m, [currentAccountId]: commentInput }));
//       setModalVisible(false);
//     } catch (e) {
//       alert('Error saving comment: ' + e.message);
//     }
//   };

//   return (
//     <div
//       className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"
//       style={{
//         background:  'linear-gradient(to bottom right, #f5f7fa, #e9ecef)',
//         fontFamily: "'Poppins', sans-serif'"
//       }}
//     >
//       <div
//         className="card shadow p-4 p-md-5 w-100"
//         style={{
//           maxWidth:       '1100px',
//           backgroundColor:'#ffffffdd',
//           borderRadius:   '1rem'
//         }}
//       >
//         <Breadcrumbs
//           path={[
//             { name: 'PMO Dashboard', page: '' },
//             { name: 'Revenue Forecast – Early View', page: 'upload' },
//             { name: 'Account Level', page: 'accounts' }
//           ]}
//         />
//         <h2 className="text-center mb-4 fw-semibold text-dark">
//           🏢 Account Level Overview
//         </h2>

//         {loading ? (
//           <div className="d-flex justify-content-center align-items-center">
//             <div className="spinner-border text-primary" role="status" />
//             <p className="ms-3 text-primary">Loading Account Data...</p>
//           </div>
//         ) : error ? (
//           <div className="d-flex flex-column justify-content-center align-items-center text-danger">
//             <p className="fs-4">Error: {error}</p>
//             <button
//               className="btn btn-primary mt-3"
//               onClick={() => navigate('/upload')}
//             >
//               Go to Upload Page
//             </button>
//           </div>
//         ) : (
//           <div className="table-responsive rounded">
//             <table
//               ref={tableRef}
//               className="display table table-hover align-middle table-bordered mb-0"
//               style={{ width: '100%' }}
//             >
//               <thead
//                 className="text-white"
//                 style={{
//                   background: 'linear-gradient(to right, #1d4ed8, #2563eb)'
//                 }}
//               >
//                 <tr>
//                   <th>Account ID</th>
//                   <th>Account Name</th>
//                   <th>Total Projects</th>
//                   <th>Total Revenue</th>
//                   <th>Forecast Revenue</th>
//                   <th>Revenue Difference</th>
//                   <th className="text-center">Comment</th>
//                   <th className="text-center">View</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {accounts.map((acc) => (
//                   <tr key={acc.accountId}>
//                     <td>{acc.accountId}</td>
//                     <td>{acc.accountName}</td>
//                     <td>{acc.totalProjects}</td>
//                     <td>{formatCurrency(acc.totalRevenue)}</td>
//                     <td>{formatCurrency(0)}</td>
//                     <td>{formatCurrency(0)}</td>
                    
//                     <td className="text-center">
//                       <button
//                         className="btn btn-sm btn-outline-secondary"
//                         onClick={() => openCommentModal(acc.accountId)}
//                       >
//                         💬
//                       </button>
//                     </td>
//                     <td className="text-center">
//                       <button
//                         className="btn btn-sm btn-outline-primary rounded-circle"
//                         onClick={() =>
//                           navigate(`/accounts/${acc.accountId}/projects`, {
//                             state: {
//                               accountId: acc.accountId,
//                               month:     activeMonth,
//                               year:      activeYear
//                             }
//                           })
//                         }
//                       >
//                         🔍
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {modalVisible && (
//         <div
//           className="modal fade show d-block"
//           style={{ backgroundColor: '#00000066' }}
//         >
//           <div className="modal-dialog modal-dialog-centered">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">💬 Comment for {currentAccountId}</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setModalVisible(false)}
//                 />
//               </div>
//               <div className="modal-body">
//                 <textarea
//                   className="form-control"
//                   rows="4"
//                   value={commentInput}
//                   onChange={(e) => setCommentInput(e.target.value)}
//                 />
//               </div>
//               <div className="modal-footer">
//                 <button
//                   className="btn btn-secondary"
//                   onClick={() => setModalVisible(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="btn btn-primary"
//                   onClick={saveComment}
//                   disabled={!commentInput.trim()}
//                 >
//                   Save
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AccountLevel;


// src/components/Details/AccountLevel.js

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation }           from 'react-router-dom';
import $                                      from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import Breadcrumbs                            from '../Breadcrumbs';
import commonData                             from '../../data/commonData.json';

const AccountLevel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tableRef = useRef(null);

  // UI state
  const [accounts, setAccounts]               = useState([]);
  const [commentsMap, setCommentsMap]         = useState({});
  const [modalVisible, setModalVisible]       = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState(null);
  const [commentInput, setCommentInput]       = useState('');
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [activeMonth, setActiveMonth]         = useState(null);
  const [activeYear, setActiveYear]           = useState(null);

  const BACKEND_URL = 'http://localhost:8081';

  // Currency formatter
  const {
    locale,
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  } = commonData.currencySettings;

  const formatCurrency = (v = 0) =>
    v.toLocaleString(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    });

  // Load Poppins font
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Poppins', sans-serif";
  }, []);

  // 1) Fetch account rows and seed commentsMap
  useEffect(() => {
    const fetchAccountData = async (month, year) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(`${BACKEND_URL}/api/account`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ month, year })
        });
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(txt || resp.statusText);
        }
        const data = await resp.json();
        const list = Array.isArray(data) ? data : [data].filter(Boolean);
        setAccounts(list);

        // seed commentsMap from accountComment field
        const initMap = {};
        list.forEach(acc => {
          if (acc.accountComment) {
            initMap[acc.accountId] = acc.accountComment;
          }
        });
        setCommentsMap(initMap);
      } catch (e) {
        console.error(e);
        setError(`Failed to load accounts: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    let m = location.state?.month;
    let y = location.state?.year;
    if (!m || !y) {
      const sm = sessionStorage.getItem('lastFetchedAccountMonth');
      const sy = sessionStorage.getItem('lastFetchedAccountYear');
      if (sm && sy) {
        m = +sm;
        y = +sy;
      }
    }

    if (m && y) {
      if (m !== activeMonth || y !== activeYear || accounts.length === 0) {
        setActiveMonth(m);
        setActiveYear(y);
        sessionStorage.setItem('lastFetchedAccountMonth', m.toString());
        sessionStorage.setItem('lastFetchedAccountYear', y.toString());
        fetchAccountData(m, y);
      }
    } else {
      setError('Missing month or year. Please go back.');
      setLoading(false);
    }
  }, [location.state, activeMonth, activeYear, accounts.length]);

  // 2) Initialize & destroy DataTable
  useEffect(() => {
    if (!loading && accounts.length > 0 && tableRef.current) {
      const $tbl = $(tableRef.current);
      if ($.fn.DataTable.isDataTable($tbl)) {
        $tbl.DataTable().destroy();
      }
      $tbl.DataTable({
        paging:    true,
        searching: true,
        ordering:  true,
        info:      true,
        autoWidth: false
      });
    }
    return () => {
      if (tableRef.current) {
        const $tbl = $(tableRef.current);
        if ($.fn.DataTable.isDataTable($tbl)) {
          $tbl.DataTable().destroy();
        }
      }
    };
  }, [loading, accounts]);

  // 3) Open modal & set input from commentsMap
  const openCommentModal = (accId) => {
    setCurrentAccountId(accId);
    setCommentInput(commentsMap[accId] || '');
    setModalVisible(true);
  };

  // 4) Save or update comment and update state
  const saveComment = async () => {
    try {
      const dto = {
        accId:   currentAccountId,
        month:   activeMonth,
        year:    activeYear,
        comment: commentInput
      };
      const resp = await fetch(`${BACKEND_URL}/api/account/comment`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(dto)
      });
      if (!resp.ok) {
        throw new Error(await resp.text());
      }

      // update local comment map
      setCommentsMap(m => ({ ...m, [currentAccountId]: commentInput }));
      // update account list so accountComment is in sync
      setAccounts(list =>
        list.map(acc =>
          acc.accountId === currentAccountId
            ? { ...acc, accountComment: commentInput }
            : acc
        )
      );

      setModalVisible(false);
    } catch (e) {
      alert('Error saving comment: ' + e.message);
    }
  };

  const breadcrumbPath = [
    { name: 'PMO Dashboard', page: '' },
    { name: 'Revenue Forecast – Early View', page: 'upload' },
    { name: 'Account Level', page: 'accounts' }
  ];

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"
      style={{
        background:  'linear-gradient(to bottom right, #f5f7fa, #e9ecef)',
        fontFamily: "'Poppins', sans-serif'"
      }}
    >
      <div
        className="card shadow p-4 p-md-5 w-100"
        style={{
          maxWidth:       '1100px',
          backgroundColor:'#ffffffdd',
          borderRadius:   '1rem'
        }}
      >
        <Breadcrumbs path={breadcrumbPath} />
        <h2 className="text-center mb-4 fw-semibold text-dark">
          🏢 Account Level Overview
        </h2>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center">
            <div className="spinner-border text-primary" role="status" />
            <p className="ms-3 text-primary">Loading Account Data...</p>
          </div>
        ) : error ? (
          <div className="d-flex flex-column justify-content-center align-items-center text-danger">
            <p className="fs-4">Error: {error}</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => navigate('/upload')}
            >
              Go to Upload Page
            </button>
          </div>
        ) : (
          <div className="table-responsive rounded">
            <table
              ref={tableRef}
              className="display table table-hover align-middle table-bordered mb-0"
              style={{ width: '100%' }}
            >
              <thead
                className="text-white"
                style={{
                  background: 'linear-gradient(to right, #1d4ed8, #2563eb)'
                }}
              >
                <tr>
                  <th>Account ID</th>
                  <th>Account Name</th>
                  <th>Total Projects</th>
                  <th>Total Revenue</th>
                  <th>Forecast Revenue</th>
                  <th>Revenue Difference</th>
                  <th className="text-center">Comment</th>
                  <th className="text-center">View</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(acc => (
                  <tr key={acc.accountId}>
                    <td>{acc.accountId}</td>
                    <td>{acc.accountName}</td>
                    <td>{acc.totalProjects}</td>
                    <td>{formatCurrency(acc.totalRevenue)}</td>
                    <td>{formatCurrency(0)}</td>
                    <td>{formatCurrency(0)}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => openCommentModal(acc.accountId)}
                      >
                        💬
                      </button>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary rounded-circle"
                        onClick={() =>
                          navigate(`/accounts/${acc.accountId}/projects`, {
                            state: {
                              accountId: acc.accountId,
                              month:      activeMonth,
                              year:       activeYear
                            }
                          })
                        }
                      >
                        🔍
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalVisible && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: '#00000066' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  💬 Comment for {currentAccountId}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalVisible(false)}
                />
              </div>
              <div className="modal-body">
                <textarea
                  className="form-control"
                  rows="4"
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setModalVisible(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={saveComment}
                  disabled={!commentInput.trim()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountLevel;

// import React, { useEffect, useState } from 'react';

// import { useNavigate, useParams, useLocation } from 'react-router-dom';

// import Breadcrumbs from '../Breadcrumbs'; // Corrected path as per your project structure

// const DateLevel = () => {

//   const navigate = useNavigate();

//   const { projectId: urlProjectId, associateId: urlAssociateId } = useParams(); // Get params from URL

//   const location = useLocation(); // Hook to access location state

//   // State for fetched daily hour data

//   const [dailyHours, setDailyHours] = useState([]);

//   // State for loading indicator

//   const [loading, setLoading] = useState(true);

//   // State for error messages

//   const [error, setError] = useState(null);

//   // States to keep track of the context for which data was last fetched

//   const [activeMonth, setActiveMonth] = useState(null);

//   const [activeYear, setActiveYear] = useState(null);

//   const [activeProjectId, setActiveProjectId] = useState(null);

//   const [activeProjectName, setActiveProjectName] = useState('Loading...');

//   const [activeAssociateId, setActiveAssociateId] = useState(null);

//   const [activeAssociateName, setActiveAssociateName] = useState('Loading...');

//   const [activeAccountId, setActiveAccountId] = useState(null);

//   const [activeAccountName, setActiveAccountName] = useState('Loading...');

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

//   // Effect to handle context and fetch data

//   useEffect(() => {

//     const fetchDailyHoursData = async (month, year, projId, assocId) => {

//       setLoading(true);

//       setError(null);

//       // Construct the request body as expected by your backend

//       const requestBody = {

//         month: month,

//         year: year,

//         projectId: projId,

//         associateId: assocId

//       };

//       console.log("Fetching daily hours data with request body (POST):", requestBody); // For debugging

//       try {

//         const response = await fetch(`${BACKEND_URL}/api/date-level`, {

//           method: 'POST', // As per your backend spec

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

//         setDailyHours(Array.isArray(data) ? data : [data].filter(Boolean));

//         // Try to derive names from fetched data if available

//         if (data && data.length > 0) {

//           if (data[0].projectName) setActiveProjectName(data[0].projectName);

//           if (data[0].associateName) setActiveAssociateName(data[0].associateName);

//           if (data[0].accountName) setActiveAccountName(data[0].accountName);

//           if (data[0].accountId) setActiveAccountId(data[0].accountId);

//         } else {

//           // Fallback to stored names or IDs if data is empty or names are missing

//           const storedProjectName = sessionStorage.getItem('lastFetchedDateProjectName');

//           const storedAssociateName = sessionStorage.getItem('lastFetchedDateAssociateName');

//           const storedAccountName = sessionStorage.getItem('lastFetchedDateAccountName');

//           const storedAccountId = sessionStorage.getItem('lastFetchedDateAccountId');

//           if (storedProjectName) setActiveProjectName(storedProjectName); else setActiveProjectName(projId);

//           if (storedAssociateName) setActiveAssociateName(storedAssociateName); else setActiveAssociateName(assocId);

//           if (storedAccountName) setActiveAccountName(storedAccountName); else setActiveAccountName('Unknown Account');

//           if (storedAccountId) setActiveAccountId(storedAccountId); else setActiveAccountId('Unknown Account ID');

//         }

//       } catch (err) {

//         console.error("Error fetching daily hours data:", err);

//         setError(`Failed to load daily hours data: ${err.message || "Network error"}`);

//       } finally {

//         setLoading(false);

//       }

//     };

//     // Logic to determine context for fetching

//     let monthToUse = location.state?.month;

//     let yearToUse = location.state?.year;

//     let projectIdToUse = urlProjectId;

//     let associateIdToUse = urlAssociateId;

//     let projectNameToUse = location.state?.projectName;

//     let associateNameToUse = location.state?.associateName;

//     let accountIdToUse = location.state?.accountId;

//     let accountNameToUse = location.state?.accountName;

//     // If context is not in location.state (e.g., on back navigation), check sessionStorage

//     if (!monthToUse || !yearToUse || !projectIdToUse || !associateIdToUse || !projectNameToUse || !associateNameToUse || !accountIdToUse || !accountNameToUse) {

//       const storedMonth = sessionStorage.getItem('lastFetchedDateMonth');

//       const storedYear = sessionStorage.getItem('lastFetchedDateYear');

//       const storedProjectId = sessionStorage.getItem('lastFetchedDateProjectId');

//       const storedAssociateId = sessionStorage.getItem('lastFetchedDateAssociateId');

//       const storedProjectName = sessionStorage.getItem('lastFetchedDateProjectName');

//       const storedAssociateName = sessionStorage.getItem('lastFetchedDateAssociateName');

//       const storedAccountId = sessionStorage.getItem('lastFetchedDateAccountId');

//       const storedAccountName = sessionStorage.getItem('lastFetchedDateAccountName');

//       if (storedMonth && storedYear && storedProjectId && storedAssociateId) {

//         monthToUse = parseInt(storedMonth, 10);

//         yearToUse = parseInt(storedYear, 10);

//         projectIdToUse = storedProjectId;

//         associateIdToUse = storedAssociateId;

//         if (storedProjectName) projectNameToUse = storedProjectName;

//         if (storedAssociateName) associateNameToUse = storedAssociateName;

//         if (storedAccountId) accountIdToUse = storedAccountId;

//         if (storedAccountName) accountNameToUse = storedAccountName;

//       }

//     }

//     // If we have valid context, set active states and fetch data if needed

//     if (monthToUse && yearToUse && projectIdToUse && associateIdToUse && projectNameToUse && associateNameToUse && accountIdToUse && accountNameToUse) {

//       // Only fetch if the context has changed or if dailyHours are empty

//       if (

//         monthToUse !== activeMonth ||

//         yearToUse !== activeYear ||

//         projectIdToUse !== activeProjectId ||

//         associateIdToUse !== activeAssociateId ||

//         dailyHours.length === 0

//       ) {

//         setActiveMonth(monthToUse);

//         setActiveYear(yearToUse);

//         setActiveProjectId(projectIdToUse);

//         setActiveAssociateId(associateIdToUse);

//         setActiveProjectName(projectNameToUse);

//         setActiveAssociateName(associateNameToUse);

//         setActiveAccountId(accountIdToUse);

//         setActiveAccountName(accountNameToUse);

//         // Store current context in sessionStorage

//         sessionStorage.setItem('lastFetchedDateMonth', monthToUse.toString());

//         sessionStorage.setItem('lastFetchedDateYear', yearToUse.toString());

//         sessionStorage.setItem('lastFetchedDateProjectId', projectIdToUse);

//         sessionStorage.setItem('lastFetchedDateAssociateId', associateIdToUse);

//         sessionStorage.setItem('lastFetchedDateProjectName', projectNameToUse);

//         sessionStorage.setItem('lastFetchedDateAssociateName', associateNameToUse);

//         sessionStorage.setItem('lastFetchedDateAccountId', accountIdToUse);

//         sessionStorage.setItem('lastFetchedDateAccountName', accountNameToUse);

//         fetchDailyHoursData(monthToUse, yearToUse, projectIdToUse, associateIdToUse);

//       } else {

//         // Data is already present for the active context, no need to fetch

//         setLoading(false);

//       }

//     } else {

//       // No valid context found, show error

//       setError("Missing daily hours context. Please go back and select an associate.");

//       setLoading(false);

//     }

//   }, [location.state, urlProjectId, urlAssociateId, BACKEND_URL, activeMonth, activeYear, activeProjectId, activeAssociateId, activeProjectName, activeAssociateName, activeAccountId, activeAccountName, dailyHours.length]); // Dependencies for useEffect

//   // Adjust breadcrumb path based on active states

//   const breadcrumbPath = [

//     { name: 'PMO Dashboard', page: '' },

//     { name: 'Revenue Forecast - Early View', page: 'upload' },

//     { name: 'Account Level', page: 'accounts' },

//     { name: `Projects (${activeAccountName})`, page: `accounts/${activeAccountId}/projects` },

//     { name: `Associates (${activeProjectName})`, page: `projects/${activeProjectId}/associates` },

//     { name: `Daily View (${activeAssociateName})`, page: `projects/${activeProjectId}/associates/${activeAssociateId}/daily` }

//   ];

//   // Render loading state

//   if (loading) {

//     return (

//       <div className="min-vh-100 d-flex justify-content-center align-items-center">

//         <div className="spinner-border text-primary" role="status">

//           <span className="visually-hidden">Loading Daily Hours Data...</span>

//         </div>

//         <p className="ms-3 text-primary">Loading Daily Hours Data...</p>

//       </div>

//     );

//   }

//   // Render error state

//   if (error) {

//     return (

//       <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-danger">

//         <p className="fs-4">Error: {error}</p>

//         <button className="btn btn-primary mt-3" onClick={() => navigate(`/projects/${activeProjectId}/associates`)}>

//           Go to Associate Level

//         </button>

//       </div>

//     );

//   }

//   return (

//     <div

//       className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"

//       style={{

//         background: 'linear-gradient(to bottom right, #f8fafc, #e0e7ef)',

//         fontFamily: "'Poppins', sans-serif"

//       }}

//     >

//       <div

//         className="card shadow p-4 w-100"

//         style={{

//           maxWidth: '950px', // Adjusted max-width for more columns

//           backgroundColor: '#ffffffee',

//           borderRadius: '1rem'

//         }}

//       >

//         <Breadcrumbs path={breadcrumbPath} />

//         <h2 className="text-center mb-4 fw-semibold text-dark">

//           📅 Daily Hours – {activeAssociateName}

//         </h2>

//         <div className="table-responsive rounded">

//           <table className="table table-hover table-borderless align-middle mb-0">

//             <thead

//               style={{

//                 background: 'linear-gradient(to right, #60a5fa, #3b82f6)',

//                 color: 'white'

//               }}

//             >

//               <tr>

//                 {/* Updated Column Headers to match your DTO */}

//                 <th>Date</th>

//                 <th>Associate ID</th>

//                 <th>Associate Name</th>

//                 <th>Project ID</th>

//                 <th>Project Name</th>

//                 <th>Company Hours</th>

//                 <th>Client Hours</th>

//                 <th>Variance Time Units</th>

//                 <th>Comparison Result</th>

//               </tr>

//             </thead>

//             <tbody>

//               {dailyHours.length > 0 ? (

//                 dailyHours.map((daily, index) => {

//                   // Use varianceTimeUnits directly from DTO if available, otherwise calculate

//                   const variance = daily.varianceTimeUnits !== undefined && daily.varianceTimeUnits !== null

//                     ? daily.varianceTimeUnits

//                     : (daily.companyHours - daily.clientHours);

//                   return (

//                     <tr key={index} style={{ backgroundColor: '#fbfbfb' }}>

//                       <td>{daily.date}</td>

//                       <td>{daily.associateId}</td>

//                       <td>{daily.associateName}</td>

//                       <td>{daily.projectId}</td>

//                       <td>{daily.projectName}</td>

//                       <td>{daily.companyHours}</td>

//                       <td>{daily.clientHours}</td>

//                       <td

//                         className={`fw-semibold ${variance > 0

//                             ? 'text-danger'

//                             : variance < 0

//                               ? 'text-primary'

//                               : 'text-success'

//                           }`}

//                       >

//                         {variance}

//                       </td>

//                       <td>{daily.comparisonResult}</td>

//                     </tr>

//                   );

//                 })

//               ) : (

//                 <tr>

//                   <td colSpan="9" className="text-center py-4 text-muted">

//                     No daily hour data available for this associate and period.

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

// export default DateLevel;


// src/components/Details/DateLevel.js

// import React, { useRef, useEffect, useState } from 'react';
// import { useNavigate, useParams, useLocation } from 'react-router-dom';
// import $ from 'jquery';
// import 'datatables.net';
// import 'datatables.net-dt/css/dataTables.dataTables.min.css';
// import Breadcrumbs from '../Breadcrumbs';
// import commonData from '../../data/commonData.json';

// const DateLevel = () => {
//   const navigate = useNavigate();
//   const { projectId: urlProjectId, associateId: urlAssociateId } = useParams();
//   const location = useLocation();
//   const tableRef = useRef(null);

//   const [dailyHours, setDailyHours]               = useState([]);
//   const [loading, setLoading]                     = useState(true);
//   const [error, setError]                         = useState(null);
//   const [activeMonth, setActiveMonth]             = useState(null);
//   const [activeYear, setActiveYear]               = useState(null);
//   const [activeProjectId, setActiveProjectId]     = useState(null);
//   const [activeProjectName, setActiveProjectName] = useState('Loading...');
//   const [activeAssociateId, setActiveAssociateId] = useState(null);
//   const [activeAssociateName, setActiveAssociateName] = useState('Loading...');
//   const [activeAccountId, setActiveAccountId]     = useState(null);
//   const [activeAccountName, setActiveAccountName] = useState('Loading...');

//   const BACKEND_URL = 'http://localhost:8081';

//   // Currency formatter from commonData.json
//   const {
//     locale,
//     currency,
//     minimumFractionDigits,
//     maximumFractionDigits
//   } = commonData.currencySettings;
//   const formatCurrency = (val = 0) =>
//     val.toLocaleString(locale, {
//       style: 'currency',
//       currency,
//       minimumFractionDigits,
//       maximumFractionDigits
//     });

//   // Load Poppins font once
//   useEffect(() => {
//     const link = document.createElement('link');
//     link.href =
//       'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
//     link.rel = 'stylesheet';
//     document.head.appendChild(link);
//     document.body.style.fontFamily = "'Poppins', sans-serif";
//   }, []);

//   // Fetch daily hours data
//   useEffect(() => {
//     const fetchDailyHoursData = async (month, year, projId, assocId) => {
//       setLoading(true);
//       setError(null);
//       try {
//         const response = await fetch(`${BACKEND_URL}/api/date-level`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ month, year, projectId: projId, associateId: assocId })
//         });
//         if (!response.ok) {
//           const errText = await response.text();
//           throw new Error(`status: ${response.status}, message: ${errText || response.statusText}`);
//         }
//         const data = await response.json();
//         const list = Array.isArray(data) ? data : [data].filter(Boolean);
//         setDailyHours(list);

//         if (list.length > 0) {
//           setActiveProjectName(list[0].projectName || projId);
//           setActiveAssociateName(list[0].associateName || assocId);
//           setActiveAccountName(list[0].accountName || activeAccountName);
//           setActiveAccountId(list[0].accountId || activeAccountId);
//         }
//       } catch (err) {
//         console.error('Error fetching daily hours data:', err);
//         setError(`Failed to load daily hours data: ${err.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     let monthToUse       = location.state?.month;
//     let yearToUse        = location.state?.year;
//     let projectIdToUse   = urlProjectId;
//     let associateIdToUse = urlAssociateId;
//     let projectNameToUse = location.state?.projectName;
//     let associateNameToUse = location.state?.associateName;
//     let accountIdToUse   = location.state?.accountId;
//     let accountNameToUse = location.state?.accountName;

//     if (
//       !monthToUse ||
//       !yearToUse ||
//       !projectIdToUse ||
//       !associateIdToUse ||
//       !projectNameToUse ||
//       !associateNameToUse ||
//       !accountIdToUse ||
//       !accountNameToUse
//     ) {
//       const sm  = sessionStorage.getItem('lastFetchedDateMonth');
//       const sy  = sessionStorage.getItem('lastFetchedDateYear');
//       const sp  = sessionStorage.getItem('lastFetchedDateProjectId');
//       const sa  = sessionStorage.getItem('lastFetchedDateAssociateId');
//       const spn = sessionStorage.getItem('lastFetchedDateProjectName');
//       const san = sessionStorage.getItem('lastFetchedDateAssociateName');
//       const saccId = sessionStorage.getItem('lastFetchedDateAccountId');
//       const saccName = sessionStorage.getItem('lastFetchedDateAccountName');

//       if (sm && sy && sp && sa) {
//         monthToUse        = parseInt(sm, 10);
//         yearToUse         = parseInt(sy, 10);
//         projectIdToUse    = sp;
//         associateIdToUse  = sa;
//         projectNameToUse  = spn || projectNameToUse;
//         associateNameToUse= san || associateNameToUse;
//         accountIdToUse    = saccId || accountIdToUse;
//         accountNameToUse  = saccName || accountNameToUse;
//       }
//     }

//     if (
//       monthToUse &&
//       yearToUse &&
//       projectIdToUse &&
//       associateIdToUse &&
//       projectNameToUse &&
//       associateNameToUse &&
//       accountIdToUse &&
//       accountNameToUse
//     ) {
//       if (
//         monthToUse !== activeMonth ||
//         yearToUse  !== activeYear ||
//         projectIdToUse !== activeProjectId ||
//         associateIdToUse !== activeAssociateId ||
//         dailyHours.length === 0
//       ) {
//         setActiveMonth(monthToUse);
//         setActiveYear(yearToUse);
//         setActiveProjectId(projectIdToUse);
//         setActiveAssociateId(associateIdToUse);
//         setActiveProjectName(projectNameToUse);
//         setActiveAssociateName(associateNameToUse);
//         setActiveAccountId(accountIdToUse);
//         setActiveAccountName(accountNameToUse);

//         sessionStorage.setItem('lastFetchedDateMonth', monthToUse.toString());
//         sessionStorage.setItem('lastFetchedDateYear', yearToUse.toString());
//         sessionStorage.setItem('lastFetchedDateProjectId', projectIdToUse);
//         sessionStorage.setItem('lastFetchedDateAssociateId', associateIdToUse);
//         sessionStorage.setItem('lastFetchedDateProjectName', projectNameToUse);
//         sessionStorage.setItem('lastFetchedDateAssociateName', associateNameToUse);
//         sessionStorage.setItem('lastFetchedDateAccountId', accountIdToUse);
//         sessionStorage.setItem('lastFetchedDateAccountName', accountNameToUse);

//         fetchDailyHoursData(monthToUse, yearToUse, projectIdToUse, associateIdToUse);
//       } else {
//         setLoading(false);
//       }
//     } else {
//       setError('Missing daily hours context. Please go back and select an associate.');
//       setLoading(false);
//     }
//   }, [
//     location.state,
//     urlProjectId,
//     urlAssociateId,
//     activeMonth,
//     activeYear,
//     activeProjectId,
//     activeAssociateId,
//     dailyHours.length
//   ]);

//   // Initialize & destroy DataTable whenever data changes
//   useEffect(() => {
//     if (!loading && dailyHours.length > 0 && tableRef.current) {
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
//   }, [loading, dailyHours]);

//   const breadcrumbPath = [
//     { name: 'PMO Dashboard', page: '' },
//     { name: 'Revenue Forecast - Early View', page: 'upload' },
//     { name: 'Account Level', page: 'accounts' },
//     {
//       name: `Projects (${activeAccountName})`,
//       page: `accounts/${activeAccountId}/projects`
//     },
//     {
//       name: `Associates (${activeProjectName})`,
//       page: `projects/${activeProjectId}/associates`
//     },
//     {
//       name: `Daily View (${activeAssociateName})`,
//       page: `projects/${activeProjectId}/associates/${activeAssociateId}/daily`
//     }
//   ];

//   if (loading) {
//     return (
//       <div className="min-vh-100 d-flex justify-content-center align-items-center">
//         <div className="spinner-border text-primary" role="status" />
//         <p className="ms-3 text-primary">Loading Daily Hours Data...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-danger">
//         <p className="fs-4">Error: {error}</p>
//         <button
//           className="btn btn-primary mt-3"
//           onClick={() => navigate(`/projects/${activeProjectId}/associates`)}
//         >
//           Go to Associate Level
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"
//       style={{
//         background: 'linear-gradient(to bottom right, #f8fafc, #e0e7ef)',
//         fontFamily: "'Poppins', sans-serif"
//       }}
//     >
//       <div
//         className="card shadow p-4 w-100"
//         style={{
//           maxWidth: '950px',
//           backgroundColor: '#ffffffee',
//           borderRadius: '1rem'
//         }}
//       >
//         <Breadcrumbs path={breadcrumbPath} />

//         <h2 className="text-center mb-4 fw-semibold text-dark">
//           📅 Daily Hours – {activeAssociateName}
//         </h2>

//         <div className="table-responsive rounded">
//           <table
//             ref={tableRef}
//             className="display table table-hover table-borderless align-middle mb-0"
//             style={{ width: '100%' }}
//           >
//             <thead
//               style={{
//                 background: 'linear-gradient(to right, #60a5fa, #3b82f6)',
//                 color: 'white'
//               }}
//             >
//               <tr>
//                 <th>Date</th>
//                 <th>Associate ID</th>
//                 <th>Associate Name</th>
//                 <th>Project ID</th>
//                 <th>Project Name</th>
//                 <th>Company Hours</th>
//                 <th>Client Hours</th>
//                 <th>Variance Time Units</th>
//                 <th>Comparison Result</th>
//               </tr>
//             </thead>
//             <tbody>
//               {dailyHours.map((daily, idx) => {
//                 const variance =
//                   daily.varianceTimeUnits != null
//                     ? daily.varianceTimeUnits
//                     : daily.companyHours - daily.clientHours;
//                 return (
//                   <tr key={idx}>
//                     <td>{daily.date}</td>
//                     <td>{daily.associateId}</td>
//                     <td>{daily.associateName}</td>
//                     <td>{daily.projectId}</td>
//                     <td>{daily.projectName}</td>
//                     <td>{daily.companyHours}</td>
//                     <td>{daily.clientHours}</td>
//                     <td
//                       className={`fw-semibold ${
//                         variance > 0
//                           ? 'text-danger'
//                           : variance < 0
//                           ? 'text-primary'
//                           : 'text-success'
//                       }`}
//                     >
//                       {variance}
//                     </td>
//                     <td>{daily.comparisonResult}</td>
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

// export default DateLevel;


import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import Breadcrumbs from '../Breadcrumbs';
import commonData from '../../data/commonData.json';

const DateLevel = () => {
  const navigate = useNavigate();
  const { projectId: urlProjectId, associateId: urlAssociateId } = useParams();
  const location = useLocation();
  const tableRef = useRef(null);

  const [dailyHours, setDailyHours]               = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState(null);
  const [activeMonth, setActiveMonth]             = useState(null);
  const [activeYear, setActiveYear]               = useState(null);
  const [activeProjectId, setActiveProjectId]     = useState(null);
  const [activeProjectName, setActiveProjectName] = useState('Loading...');
  const [activeAssociateId, setActiveAssociateId] = useState(null);
  const [activeAssociateName, setActiveAssociateName] = useState('Loading...');
  const [activeAccountId, setActiveAccountId]     = useState(null);
  const [activeAccountName, setActiveAccountName] = useState('Loading...');

  const BACKEND_URL = 'http://localhost:8081';

  // Currency formatter from commonData.json
  const {
    locale,
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  } = commonData.currencySettings;
  const formatCurrency = (val = 0) =>
    val.toLocaleString(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    });

  // Load Poppins font once
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Poppins', sans-serif";
  }, []);

  // Fetch daily hours data
  useEffect(() => {
    const fetchDailyHoursData = async (month, year, projId, assocId) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BACKEND_URL}/api/date-level`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ month, year, projectId: projId, associateId: assocId })
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`status: ${response.status}, message: ${errText || response.statusText}`);
        }
        const data = await response.json();
        const list = Array.isArray(data) ? data : [data].filter(Boolean);
        setDailyHours(list);

        if (list.length > 0) {
          setActiveProjectName(list[0].projectName || projId);
          setActiveAssociateName(list[0].associateName || assocId);
          setActiveAccountName(list[0].accountName || activeAccountName);
          setActiveAccountId(list[0].accountId || activeAccountId);
        }
      } catch (err) {
        console.error('Error fetching daily hours data:', err);
        setError(`Failed to load daily hours data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Derive values from location or sessionStorage
    let monthToUse         = location.state?.month;
    let yearToUse          = location.state?.year;
    let projectIdToUse     = urlProjectId;
    let associateIdToUse   = urlAssociateId;
    let projectNameToUse   = location.state?.projectName;
    let associateNameToUse = location.state?.associateName;
    let accountIdToUse     = location.state?.accountId;
    let accountNameToUse   = location.state?.accountName;

    if (
      !monthToUse ||
      !yearToUse ||
      !projectIdToUse ||
      !associateIdToUse ||
      !projectNameToUse ||
      !associateNameToUse ||
      !accountIdToUse ||
      !accountNameToUse
    ) {
      const sm      = sessionStorage.getItem('lastFetchedDateMonth');
      const sy      = sessionStorage.getItem('lastFetchedDateYear');
      const sp      = sessionStorage.getItem('lastFetchedDateProjectId');
      const sa      = sessionStorage.getItem('lastFetchedDateAssociateId');
      const spn     = sessionStorage.getItem('lastFetchedDateProjectName');
      const san     = sessionStorage.getItem('lastFetchedDateAssociateName');
      const saccId  = sessionStorage.getItem('lastFetchedDateAccountId');
      const saccName= sessionStorage.getItem('lastFetchedDateAccountName');

      if (sm && sy && sp && sa) {
        monthToUse         = parseInt(sm, 10);
        yearToUse          = parseInt(sy, 10);
        projectIdToUse     = sp;
        associateIdToUse   = sa;
        projectNameToUse   = spn || projectNameToUse;
        associateNameToUse = san || associateNameToUse;
        accountIdToUse     = saccId || accountIdToUse;
        accountNameToUse   = saccName || accountNameToUse;
      }
    }

    if (
      monthToUse &&
      yearToUse &&
      projectIdToUse &&
      associateIdToUse &&
      projectNameToUse &&
      associateNameToUse &&
      accountIdToUse &&
      accountNameToUse
    ) {
      if (
        monthToUse !== activeMonth ||
        yearToUse !== activeYear ||
        projectIdToUse !== activeProjectId ||
        associateIdToUse !== activeAssociateId ||
        dailyHours.length === 0
      ) {
        setActiveMonth(monthToUse);
        setActiveYear(yearToUse);
        setActiveProjectId(projectIdToUse);
        setActiveAssociateId(associateIdToUse);
        setActiveProjectName(projectNameToUse);
        setActiveAssociateName(associateNameToUse);
        setActiveAccountId(accountIdToUse);
        setActiveAccountName(accountNameToUse);

        sessionStorage.setItem('lastFetchedDateMonth', monthToUse.toString());
        sessionStorage.setItem('lastFetchedDateYear', yearToUse.toString());
        sessionStorage.setItem('lastFetchedDateProjectId', projectIdToUse);
        sessionStorage.setItem('lastFetchedDateAssociateId', associateIdToUse);
        sessionStorage.setItem('lastFetchedDateProjectName', projectNameToUse);
        sessionStorage.setItem('lastFetchedDateAssociateName', associateNameToUse);
        sessionStorage.setItem('lastFetchedDateAccountId', accountIdToUse);
        sessionStorage.setItem('lastFetchedDateAccountName', accountNameToUse);

        fetchDailyHoursData(monthToUse, yearToUse, projectIdToUse, associateIdToUse);
      } else {
        setLoading(false);
      }
    } else {
      setError('Missing daily hours context. Please go back and select an associate.');
      setLoading(false);
    }
  }, [
    location.state,
    urlProjectId,
    urlAssociateId,
    activeMonth,
    activeYear,
    activeProjectId,
    activeAssociateId,
    dailyHours.length
  ]);

  // Initialize & destroy DataTable with stable ref
  useEffect(() => {
    const tableEl = tableRef.current;
    if (!loading && dailyHours.length > 0 && tableEl) {
      const $tbl = $(tableEl);
      if ($.fn.DataTable.isDataTable(tableEl)) {
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
      if (tableEl && $.fn.DataTable.isDataTable(tableEl)) {
        $(tableEl).DataTable().destroy();
      }
    };
  }, [loading, dailyHours]);

  const breadcrumbPath = [
    { name: 'PMO Dashboard', page: '' },
    { name: 'Revenue Forecast - Early View', page: 'upload' },
    { name: 'Account Level', page: 'accounts' },
    {
      name: `Projects (${activeAccountName})`,
      page: `accounts/${activeAccountId}/projects`
    },
    {
      name: `Associates (${activeProjectName})`,
      page: `projects/${activeProjectId}/associates`
    },
    {
      name: `Daily View (${activeAssociateName})`,
      page: `projects/${activeProjectId}/associates/${activeAssociateId}/daily`
    }
  ];

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="ms-3 text-primary">Loading Daily Hours Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-danger">
        <p className="fs-4">Error: {error}</p>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate(`/projects/${activeProjectId}/associates`)}
        >
          Go to Associate Level
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"
      style={{
        background: 'linear-gradient(to bottom right, #f8fafc, #e0e7ef)',
        fontFamily: "'Poppins', sans-serif"
      }}
    >
      <div
        className="card shadow p-4 w-100"
        style={{
          maxWidth: '950px',
          backgroundColor: '#ffffffee',
          borderRadius: '1rem'
        }}
      >
        <Breadcrumbs path={breadcrumbPath} />

        <h2 className="text-center mb-4 fw-semibold text-dark">
          📅 Daily Hours – {activeAssociateName}
        </h2>

        <div className="table-responsive rounded">
          <table
            ref={tableRef}
            className="display table table-hover table-borderless align-middle mb-0"
            style={{ width: '100%' }}
          >
            <thead
              style={{
                background: 'linear-gradient(to right, #60a5fa, #3b82f6)',
                color: 'white'
              }}
            >
              <tr>
                <th>Date</th>
                <th>Associate ID</th>
                <th>Associate Name</th>
                <th>Project ID</th>
                <th>Project Name</th>
                <th>Company Hours</th>
                <th>Client Hours</th>
                <th>Variance Time Units</th>
                <th>Comparison Result</th>
              </tr>
            </thead>
            <tbody>
              {dailyHours.map((daily, idx) => {
                const variance =
                  daily.varianceTimeUnits != null
                    ? daily.varianceTimeUnits
                    : daily.companyHours - daily.clientHours;
                return (
                  <tr key={idx}>
                    <td>{daily.date}</td>
                    <td>{daily.associateId}</td>
                    <td>{daily.associateName}</td>
                    <td>{daily.projectId}</td>
                    <td>{daily.projectName}</td>
                    <td>{daily.companyHours}</td>
                    <td>{daily.clientHours}</td>
                    <td
                      className={`fw-semibold ${
                        variance > 0
                          ? 'text-danger'
                          : variance < 0
                          ? 'text-primary'
                          : 'text-success'
                      }`}
                    >
                      {variance}
                    </td>
                    <td>{daily.comparisonResult}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DateLevel;

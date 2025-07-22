// import React, { useEffect, useState } from 'react';
// import { useNavigate, useParams, useLocation } from 'react-router-dom';
// import Breadcrumbs from '../Breadcrumbs';

// // 1) Import your commonData.json
// import commonData from '../../data/commonData.json';

// const ProjectLevel = () => {
//   const navigate = useNavigate();
//   const { accountId: urlAccountId } = useParams();
//   const location = useLocation();

//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeMonth, setActiveMonth] = useState(null);
//   const [activeYear, setActiveYear] = useState(null);
//   const [activeAccountId, setActiveAccountId] = useState(null);
//   const [activeAccountName, setActiveAccountName] = useState('Loading...');
//   const BACKEND_URL = 'http://localhost:8081';

//   // 2) Destructure your currency settings
//   const {
//     locale,
//     currency,
//     minimumFractionDigits,
//     maximumFractionDigits
//   } = commonData.currencySettings;

//   // 3) Utility to format any number to your centralized currency format
//   const formatCurrency = (value = 0) =>
//     value.toLocaleString(locale, {
//       style: 'currency',
//       currency,
//       minimumFractionDigits,
//       maximumFractionDigits
//     });

//   useEffect(() => {
//     const link = document.createElement('link');
//     link.href =
//       'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
//     link.rel = 'stylesheet';
//     document.head.appendChild(link);
//     document.body.style.fontFamily = "'Poppins', sans-serif";
//   }, []);

//   useEffect(() => {
//     const fetchProjectData = async (month, year, accId) => {
//       setLoading(true);
//       setError(null);
//       const requestBody = { month, year, accId };

//       try {
//         const response = await fetch(`${BACKEND_URL}/api/project`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(requestBody),
//         });

//         if (!response.ok) {
//           const errorText = await response.text();
//           throw new Error(
//             `HTTP error! status: ${response.status}, message: ${
//               errorText || response.statusText
//             }`
//           );
//         }

//         const data = await response.json();
//         setProjects(Array.isArray(data) ? data : [data].filter(Boolean));

//         if (data && data.length > 0 && data[0].accountName) {
//           setActiveAccountName(data[0].accountName);
//         } else {
//           const storedAccountName = sessionStorage.getItem(
//             'lastFetchedProjectAccountName'
//           );
//           setActiveAccountName(storedAccountName || accId);
//         }
//       } catch (err) {
//         console.error('Error fetching project data:', err);
//         setError(
//           `Failed to load project data: ${err.message || 'Network error'}`
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     let monthToUse = location.state?.month;
//     let yearToUse = location.state?.year;
//     let accountIdToUse = urlAccountId;

//     if (!monthToUse || !yearToUse || !accountIdToUse) {
//       const storedMonth = sessionStorage.getItem('lastFetchedProjectMonth');
//       const storedYear = sessionStorage.getItem('lastFetchedProjectYear');
//       const storedAccountId = sessionStorage.getItem(
//         'lastFetchedProjectAccountId'
//       );
//       const storedAccountName = sessionStorage.getItem(
//         'lastFetchedProjectAccountName'
//       );

//       if (storedMonth && storedYear && storedAccountId) {
//         monthToUse = parseInt(storedMonth, 10);
//         yearToUse = parseInt(storedYear, 10);
//         accountIdToUse = storedAccountId;
//         if (storedAccountName) setActiveAccountName(storedAccountName);
//       }
//     }

//     if (monthToUse && yearToUse && accountIdToUse) {
//       if (
//         monthToUse !== activeMonth ||
//         yearToUse !== activeYear ||
//         accountIdToUse !== activeAccountId ||
//         projects.length === 0
//       ) {
//         setActiveMonth(monthToUse);
//         setActiveYear(yearToUse);
//         setActiveAccountId(accountIdToUse);
//         sessionStorage.setItem(
//           'lastFetchedProjectMonth',
//           monthToUse.toString()
//         );
//         sessionStorage.setItem(
//           'lastFetchedProjectYear',
//           yearToUse.toString()
//         );
//         sessionStorage.setItem(
//           'lastFetchedProjectAccountId',
//           accountIdToUse
//         );
//         if (activeAccountName && activeAccountName !== 'Loading...') {
//           sessionStorage.setItem(
//             'lastFetchedProjectAccountName',
//             activeAccountName
//           );
//         }
//         fetchProjectData(monthToUse, yearToUse, accountIdToUse);
//       } else {
//         setLoading(false);
//       }
//     } else {
//       setError(
//         'Missing project context (month, year, or account ID). Please go back and select an account.'
//       );
//       setLoading(false);
//     }
//   }, [
//     location.state,
//     urlAccountId,
//     BACKEND_URL,
//     activeMonth,
//     activeYear,
//     activeAccountId,
//     projects.length,
//     activeAccountName,
//   ]);

//   const breadcrumbPath = [
//     { name: 'PMO Dashboard', page: '' },
//     { name: 'Revenue Forecast - Early View', page: 'upload' },
//     { name: 'Account Level', page: 'accounts' },
//     {
//       name: `Projects (${activeAccountName})`,
//       page: `accounts/${activeAccountId}/projects`,
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="min-vh-100 d-flex justify-content-center align-items-center">
//         <div className="spinner-border text-primary" role="status" />
//         <p className="ms-3 text-primary">Loading Project Data...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-danger">
//         <p className="fs-4">Error: {error}</p>
//         <button
//           className="btn btn-primary mt-3"
//           onClick={() => navigate('/accounts')}
//         >
//           Go to Account Level
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"
//       style={{
//         background: 'linear-gradient(to bottom right, #f5f7fa, #e9ecef)',
//         fontFamily: "'Poppins', sans-serif",
//       }}
//     >
//       <div
//         className="card shadow p-4 p-md-5 w-100"
//         style={{ maxWidth: '1200px', backgroundColor: '#ffffffdd', borderRadius: '1rem' }}
//       >
//         <Breadcrumbs path={breadcrumbPath} />
//         <h2 className="text-center mb-4 fw-semibold text-dark">
//           📁 Project Level Overview{' '}
//           {activeAccountId ? `for ${activeAccountName}` : ''}
//         </h2>

//         <div className="table-responsive rounded">
//           <table className="table table-hover align-middle table-borderless mb-0">
//             <thead
//               className="text-white"
//               style={{ background: 'linear-gradient(to right, #3b82f6, #2563eb)' }}
//             >
//               <tr>
//                 <th className="px-3 py-2">Project ID</th>
//                 <th className="px-3 py-2">Project Name</th>
//                 <th className="px-3 py-2">Account ID</th>
//                 <th className="px-3 py-2">Account Name</th>
//                 <th className="px-3 py-2">Total Associates</th>
//                 <th className="px-3 py-2">Company Hours</th>
//                 <th className="px-3 py-2">Client Hours</th>
//                 <th className="px-3 py-2">Variance Hours</th>
//                 <th className="px-3 py-2">Revenue</th>
//                 <th className="px-3 py-2 text-center">View</th>
//               </tr>
//             </thead>
//             <tbody>
//               {projects.length > 0 ? (
//                 projects.map((project) => (
//                   <tr key={project.projectId} style={{ backgroundColor: '#fdfdfd' }}>
//                     <td className="px-3 py-2">{project.projectId}</td>
//                     <td className="px-3 py-2">{project.projectName}</td>
//                     <td className="px-3 py-2">{project.accountId}</td>
//                     <td className="px-3 py-2">{project.accountName}</td>
//                     <td className="px-3 py-2">{project.totalAssociatesCount}</td>
//                     <td className="px-3 py-2">{project.totalCompanyHours}</td>
//                     <td className="px-3 py-2">{project.totalClientHours}</td>
//                     <td className="px-3 py-2">{project.varianceHours}</td>
//                     {/* Apply the formatCurrency function to the Revenue column */}
//                     <td className="px-3 py-2">{formatCurrency(project.revenue)}</td>
//                     <td className="px-3 py-2 text-center">
//                       <button
//                         onClick={() =>
//                           navigate(`/projects/${project.projectId}/associates`, {
//                             state: {
//                               projectId: project.projectId,
//                               projectName: project.projectName,
//                               accountId: project.accountId,
//                               accountName: project.accountName,
//                               month: activeMonth,
//                               year: activeYear,
//                             },
//                           })
//                         }
//                         className="btn btn-sm btn-outline-primary rounded-circle"
//                         title="View Associates"
//                       >
//                         🔍
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="10" className="text-center text-muted py-4">
//                     No projects found for this account and period.
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

// export default ProjectLevel;


// import React, { useEffect, useState } from 'react';
// import { useNavigate, useParams, useLocation } from 'react-router-dom';
// import Breadcrumbs from '../Breadcrumbs';

// // 1) Import your commonData.json
// import commonData from '../../data/commonData.json';

// const ProjectLevel = () => {
//   const navigate = useNavigate();
//   const { accountId: urlAccountId } = useParams();
//   const location = useLocation();

//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeMonth, setActiveMonth] = useState(null);
//   const [activeYear, setActiveYear] = useState(null);
//   const [activeAccountId, setActiveAccountId] = useState(null);
//   const [activeAccountName, setActiveAccountName] = useState('Loading...');
//   const BACKEND_URL = 'http://localhost:8081';

//   // 2) Destructure your currency settings
//   const {
//     locale,
//     currency,
//     minimumFractionDigits,
//     maximumFractionDigits
//   } = commonData.currencySettings;

//   // 3) Utility to format any number to your centralized currency format
//   const formatCurrency = (value = 0) =>
//     value.toLocaleString(locale, {
//       style: 'currency',
//       currency,
//       minimumFractionDigits,
//       maximumFractionDigits
//     });

//   // --- Placeholder for Download Data Logic ---
//   const handleDownloadData = () => {
//     alert('Download Project Data button clicked! (Logic not yet implemented)');
//     // Your actual CSV generation and download logic will go here later.
//     // Similar to AccountLevel, you'll define projectCsvHeaders and build the CSV content.
//   };
//   // --- End Placeholder ---

//   useEffect(() => {
//     const link = document.createElement('link');
//     link.href =
//       'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
//     link.rel = 'stylesheet';
//     document.head.appendChild(link);
//     document.body.style.fontFamily = "'Poppins', sans-serif";
//   }, []);

//   useEffect(() => {
//     const fetchProjectData = async (month, year, accId) => {
//       setLoading(true);
//       setError(null);
//       const requestBody = { month, year, accId };

//       try {
//         const response = await fetch(`${BACKEND_URL}/api/project`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(requestBody),
//         });

//         if (!response.ok) {
//           const errorText = await response.text();
//           throw new Error(
//             `HTTP error! status: ${response.status}, message: ${
//               errorText || response.statusText
//             }`
//           );
//         }

//         const data = await response.json();
//         setProjects(Array.isArray(data) ? data : [data].filter(Boolean));

//         if (data && data.length > 0 && data[0].accountName) {
//           setActiveAccountName(data[0].accountName);
//         } else {
//           const storedAccountName = sessionStorage.getItem(
//             'lastFetchedProjectAccountName'
//           );
//           setActiveAccountName(storedAccountName || accId);
//         }
//       } catch (err) {
//         console.error('Error fetching project data:', err);
//         setError(
//           `Failed to load project data: ${err.message || 'Network error'}`
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     let monthToUse = location.state?.month;
//     let yearToUse = location.state?.year;
//     let accountIdToUse = urlAccountId;

//     if (!monthToUse || !yearToUse || !accountIdToUse) {
//       const storedMonth = sessionStorage.getItem('lastFetchedProjectMonth');
//       const storedYear = sessionStorage.getItem('lastFetchedProjectYear');
//       const storedAccountId = sessionStorage.getItem(
//         'lastFetchedProjectAccountId'
//       );
//       const storedAccountName = sessionStorage.getItem(
//         'lastFetchedProjectAccountName'
//       );

//       if (storedMonth && storedYear && storedAccountId) {
//         monthToUse = parseInt(storedMonth, 10);
//         yearToUse = parseInt(storedYear, 10);
//         accountIdToUse = storedAccountId;
//         if (storedAccountName) setActiveAccountName(storedAccountName);
//       }
//     }

//     if (monthToUse && yearToUse && accountIdToUse) {
//       if (
//         monthToUse !== activeMonth ||
//         yearToUse !== activeYear ||
//         accountIdToUse !== activeAccountId ||
//         projects.length === 0
//       ) {
//         setActiveMonth(monthToUse);
//         setActiveYear(yearToUse);
//         setActiveAccountId(accountIdToUse);
//         sessionStorage.setItem(
//           'lastFetchedProjectMonth',
//           monthToUse.toString()
//         );
//         sessionStorage.setItem(
//           'lastFetchedProjectYear',
//           yearToUse.toString()
//         );
//         sessionStorage.setItem(
//           'lastFetchedProjectAccountId',
//           accountIdToUse
//         );
//         if (activeAccountName && activeAccountName !== 'Loading...') {
//           sessionStorage.setItem(
//             'lastFetchedProjectAccountName',
//             activeAccountName
//           );
//         }
//         fetchProjectData(monthToUse, yearToUse, accountIdToUse);
//       } else {
//         setLoading(false);
//       }
//     } else {
//       setError(
//         'Missing project context (month, year, or account ID). Please go back and select an account.'
//       );
//       setLoading(false);
//     }
//   }, [
//     location.state,
//     urlAccountId,
//     BACKEND_URL,
//     activeMonth,
//     activeYear,
//     activeAccountId,
//     projects.length,
//     activeAccountName,
//   ]);

//   const breadcrumbPath = [
//     { name: 'PMO Dashboard', page: '' },
//     { name: 'Revenue Forecast - Early View', page: 'upload' },
//     { name: 'Account Level', page: 'accounts' },
//     {
//       name: `Projects (${activeAccountName})`,
//       page: `accounts/${activeAccountId}/projects`,
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="min-vh-100 d-flex justify-content-center align-items-center">
//         <div className="spinner-border text-primary" role="status" />
//         <p className="ms-3 text-primary">Loading Project Data...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-danger">
//         <p className="fs-4">Error: {error}</p>
//         <button
//           className="btn btn-primary mt-3"
//           onClick={() => navigate('/accounts')}
//         >
//           Go to Account Level
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"
//       style={{
//         background: 'linear-gradient(to bottom right, #f5f7fa, #e9ecef)',
//         fontFamily: "'Poppins', sans-serif",
//       }}
//     >
//       <div
//         className="card shadow p-4 p-md-5 w-100"
//         style={{ maxWidth: '1200px', backgroundColor: '#ffffffdd', borderRadius: '1rem' }}
//       >
//         <Breadcrumbs path={breadcrumbPath} />
//         <div className="d-flex justify-content-between align-items-center mb-4">
//           <h2 className="mb-0 fw-semibold text-dark">
//             📁 Project Level Overview{' '}
//             {activeAccountId ? `for ${activeAccountName}` : ''}
//           </h2>
//           {/* Download Button UI for Project Level */}
//           {projects.length > 0 && ( // Only show button if there's data to potentially download
//             <button
//               className="btn btn-outline-success rounded-pill px-3"
//               onClick={handleDownloadData} // This calls the placeholder function
//               title="Download Project Data"
//             >
//               <i className="bi bi-download me-2"></i> Download Data
//             </button>
//           )}
//         </div>

//         <div className="table-responsive rounded">
//           <table className="table table-hover align-middle table-borderless mb-0">
//             <thead
//               className="text-white"
//               style={{ background: 'linear-gradient(to right, #3b82f6, #2563eb)' }}
//             >
//               <tr>
//                 <th className="px-3 py-2">Project ID</th>
//                 <th className="px-3 py-2">Project Name</th>
//                 <th className="px-3 py-2">Account ID</th>
//                 <th className="px-3 py-2">Account Name</th>
//                 <th className="px-3 py-2">Total Associates</th>
//                 <th className="px-3 py-2">Company Hours</th>
//                 <th className="px-3 py-2">Client Hours</th>
//                 <th className="px-3 py-2">Variance Hours</th>
//                 <th className="px-3 py-2">Revenue</th>
//                 <th className="px-3 py-2 text-center">View</th>
//               </tr>
//             </thead>
//             <tbody>
//               {projects.length > 0 ? (
//                 projects.map((project) => (
//                   <tr key={project.projectId} style={{ backgroundColor: '#fdfdfd' }}>
//                     <td className="px-3 py-2">{project.projectId}</td>
//                     <td className="px-3 py-2">{project.projectName}</td>
//                     <td className="px-3 py-2">{project.accountId}</td>
//                     <td className="px-3 py-2">{project.accountName}</td>
//                     <td className="px-3 py-2">{project.totalAssociatesCount}</td>
//                     <td className="px-3 py-2">{project.totalCompanyHours}</td>
//                     <td className="px-3 py-2">{project.totalClientHours}</td>
//                     <td className="px-3 py-2">{project.varianceHours}</td>
//                     {/* Apply the formatCurrency function to the Revenue column */}
//                     <td className="px-3 py-2">{formatCurrency(project.revenue)}</td>
//                     <td className="px-3 py-2 text-center">
//                       <button
//                         onClick={() =>
//                           navigate(`/projects/${project.projectId}/associates`, {
//                             state: {
//                               projectId: project.projectId,
//                               projectName: project.projectName,
//                               accountId: project.accountId,
//                               accountName: project.accountName,
//                               month: activeMonth,
//                               year: activeYear,
//                             },
//                           })
//                         }
//                         className="btn btn-sm btn-outline-primary rounded-circle"
//                         title="View Associates"
//                       >
//                         🔍
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="10" className="text-center text-muted py-4">
//                     No projects found for this account and period.
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

// export default ProjectLevel;

// src/components/Details/ProjectLevel.js

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import Breadcrumbs from '../Breadcrumbs';
import commonData from '../../data/commonData.json';

const ProjectLevel = () => {
  const navigate = useNavigate();
  const { accountId: urlAccountId } = useParams();
  const location = useLocation();
  const tableRef = useRef(null);

  const [projects, setProjects]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeYear, setActiveYear]   = useState(null);
  const [activeAccountId, setActiveAccountId]   = useState(null);
  const [activeAccountName, setActiveAccountName] = useState('Loading...');

  const BACKEND_URL = 'http://localhost:8081';

  // Currency settings
  const {
    locale,
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  } = commonData.currencySettings;

  const formatCurrency = (value = 0) =>
    value.toLocaleString(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    });

  // Placeholder download logic
  const handleDownloadData = () => {
    alert('Download Project Data button clicked!');
    // Implement actual CSV/Excel download here
  };

  // Load Poppins font
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Poppins', sans-serif";
  }, []);

  // Fetch project data when context changes
  useEffect(() => {
    const fetchProjectData = async (month, year, accId) => {
      setLoading(true);
      setError(null);

      try {
        const resp = await fetch(`${BACKEND_URL}/api/project`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ month, year, accId })
        });
        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`status: ${resp.status}, message: ${errText || resp.statusText}`);
        }
        const data = await resp.json();
        const list = Array.isArray(data) ? data : [data].filter(Boolean);
        setProjects(list);

        // Derive accountName from response or sessionStorage
        if (list.length > 0 && list[0].accountName) {
          setActiveAccountName(list[0].accountName);
        } else {
          const storedName = sessionStorage.getItem('lastFetchedProjectAccountName');
          setActiveAccountName(storedName || accId);
        }
      } catch (e) {
        console.error('Error fetching project data:', e);
        setError(`Failed to load project data: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Determine context from location.state, URL, or sessionStorage
    let monthToUse     = location.state?.month;
    let yearToUse      = location.state?.year;
    let accountIdToUse = urlAccountId;
    let accountNameToUse = location.state?.accountName;

    if (!monthToUse || !yearToUse || !accountNameToUse) {
      const sm  = sessionStorage.getItem('lastFetchedProjectMonth');
      const sy  = sessionStorage.getItem('lastFetchedProjectYear');
      const sa  = sessionStorage.getItem('lastFetchedProjectAccountId');
      const san = sessionStorage.getItem('lastFetchedProjectAccountName');
      if (sm && sy && sa) {
        monthToUse      = parseInt(sm, 10);
        yearToUse       = parseInt(sy, 10);
        accountIdToUse  = sa;
        accountNameToUse = san;
      }
    }

    if (monthToUse && yearToUse && accountIdToUse) {
      if (
        monthToUse !== activeMonth ||
        yearToUse  !== activeYear ||
        accountIdToUse !== activeAccountId ||
        projects.length === 0
      ) {
        setActiveMonth(monthToUse);
        setActiveYear(yearToUse);
        setActiveAccountId(accountIdToUse);
        if (accountNameToUse) {
          setActiveAccountName(accountNameToUse);
        }
        // Persist context
        sessionStorage.setItem('lastFetchedProjectMonth', monthToUse.toString());
        sessionStorage.setItem('lastFetchedProjectYear', yearToUse.toString());
        sessionStorage.setItem('lastFetchedProjectAccountId', accountIdToUse);
        if (accountNameToUse) {
          sessionStorage.setItem('lastFetchedProjectAccountName', accountNameToUse);
        }
        fetchProjectData(monthToUse, yearToUse, accountIdToUse);
      } else {
        setLoading(false);
      }
    } else {
      setError('Missing project context (month, year, or account ID). Please go back.');
      setLoading(false);
    }
  }, [
    location.state,
    urlAccountId,
    activeMonth,
    activeYear,
    activeAccountId,
    projects.length
  ]);

  // Initialize / destroy DataTable when projects load
  useEffect(() => {
    if (!loading && projects.length > 0 && tableRef.current) {
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
  }, [loading, projects]);

  const breadcrumbPath = [
    { name: 'PMO Dashboard', page: '' },
    { name: 'Revenue Forecast - Early View', page: 'upload' },
    { name: 'Account Level', page: 'accounts' },
    {
      name: `Projects (${activeAccountName})`,
      page: `accounts/${activeAccountId}/projects`
    }
  ];

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="ms-3 text-primary">Loading Project Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-danger">
        <p className="fs-4">Error: {error}</p>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate('/accounts')}
        >
          Go to Account Level
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"
      style={{
        background: 'linear-gradient(to bottom right, #f5f7fa, #e9ecef)',
        fontFamily: "'Poppins', sans-serif"
      }}
    >
      <div
        className="card shadow p-4 p-md-5 w-100"
        style={{
          maxWidth:      '1200px',
          backgroundColor:'#ffffffdd',
          borderRadius:  '1rem'
        }}
      >
        <Breadcrumbs path={breadcrumbPath} />

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 fw-semibold text-dark">
            📁 Project Level Overview{' '}
            {activeAccountId ? `for ${activeAccountName}` : ''}
          </h2>
          {projects.length > 0 && (
            <button
              className="btn btn-outline-success rounded-pill px-3"
              onClick={handleDownloadData}
              title="Download Project Data"
            >
              <i className="bi bi-download me-2"></i> Download Data
            </button>
          )}
        </div>

        <div className="table-responsive rounded">
          <table
            ref={tableRef}
            className="display table table-hover align-middle table-borderless mb-0"
            style={{ width: '100%' }}
          >
            <thead
              className="text-white"
              style={{ background: 'linear-gradient(to right, #3b82f6, #2563eb)' }}
            >
              <tr>
                <th>Project ID</th>
                <th>Project Name</th>
                <th>Account ID</th>
                <th>Account Name</th>
                <th>Total Associates</th>
                <th>Company Hours</th>
                <th>Client Hours</th>
                <th>Variance Hours</th>
                <th>Revenue</th>
                <th className="text-center">View</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.projectId}>
                  <td>{project.projectId}</td>
                  <td>{project.projectName}</td>
                  <td>{project.accountId}</td>
                  <td>{project.accountName}</td>
                  <td>{project.totalAssociatesCount}</td>
                  <td>{project.totalCompanyHours}</td>
                  <td>{project.totalClientHours}</td>
                  <td>{project.varianceHours}</td>
                  <td>{formatCurrency(project.revenue)}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary rounded-circle"
                      onClick={() =>
                        navigate(
                          `/projects/${project.projectId}/associates`,
                          {
                            state: {
                              projectId:   project.projectId,
                              projectName: project.projectName,
                              accountId:   project.accountId,
                              accountName: project.accountName,
                              month:       activeMonth,
                              year:        activeYear
                            }
                          }
                        )
                      }
                      title="View Associates"
                    >
                      🔍
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectLevel;

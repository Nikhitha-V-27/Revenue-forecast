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

//   // UI state
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

//   // Load Poppins font
//   useEffect(() => {
//     const link = document.createElement('link');
//     link.href =
//       'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
//     link.rel = 'stylesheet';
//     document.head.appendChild(link);
//     document.body.style.fontFamily = "'Poppins', sans-serif";
//   }, []);

//   // 1) Fetch account rows and seed commentsMap
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
//           const txt = await resp.text();
//           throw new Error(txt || resp.statusText);
//         }
//         const data = await resp.json();
//         const list = Array.isArray(data) ? data : [data].filter(Boolean);
//         setAccounts(list);

//         // seed commentsMap from accountComment field
//         const initMap = {};
//         list.forEach(acc => {
//           if (acc.accountComment) {
//             initMap[acc.accountId] = acc.accountComment;
//           }
//         });
//         setCommentsMap(initMap);
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
//         sessionStorage.setItem('lastFetchedAccountMonth', m.toString());
//         sessionStorage.setItem('lastFetchedAccountYear', y.toString());

//         fetchAccountData(m, y);
//       }
//     } else {
//       setError('Missing month or year. Please go back.');
//       setLoading(false);
//     }
//   }, [location.state, activeMonth, activeYear, accounts.length]);

//   // 2) Initialize & destroy DataTable
//   useEffect(() => {
//     if (!loading && accounts.length > 0 && tableRef.current) {
//       const $tbl = $(tableRef.current);
//       if ($.fn.DataTable.isDataTable($tbl)) {
//         $tbl.DataTable().destroy();
//       }
//       $tbl.DataTable({
//         paging: true,
//         searching: true,
//         ordering: true,
//         info: true,
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

//   // 3) Open modal & set input from commentsMap
//   const openCommentModal = (accId) => {
//     setCurrentAccountId(accId);
//     setCommentInput(commentsMap[accId] || '');
//     setModalVisible(true);
//   };

//   // 4) Save or update comment and update state
//   const saveComment = async () => {
//     try {
//       const dto = {
//         accId: currentAccountId,
//         month: activeMonth,
//         year: activeYear,
//         comment: commentInput
//       };
//       const resp = await fetch(`${BACKEND_URL}/api/account/comment`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(dto)
//       });
//       if (!resp.ok) {
//         throw new Error(await resp.text());
//       }

//       // update local comment map
//       setCommentsMap(m => ({ ...m, [currentAccountId]: commentInput }));
//       // update account list so accountComment is in sync
//       setAccounts(list =>
//         list.map(acc =>
//           acc.accountId === currentAccountId
//             ? { ...acc, accountComment: commentInput }
//             : acc
//         )
//       );

//       setModalVisible(false);
//     } catch (e) {
//       alert('Error saving comment: ' + e.message);
//     }
//   };

//   const breadcrumbPath = [
//     { name: 'PMO Dashboard', page: '' },
//     { name: 'Revenue Forecast – Early View', page: 'upload' },
//     { name: 'Account Level', page: 'accounts' }
//   ];

//   return (
//     <div
//       className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"
//       style={{
//         background: 'linear-gradient(to bottom right, #f5f7fa, #e9ecef)',
//         fontFamily: "'Poppins', sans-serif'"
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
//                 {accounts.map(acc => (
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
//                               month: activeMonth,
//                               year: activeYear
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
//                 <h5 className="modal-title">
//                   💬 Comment for {currentAccountId}
//                 </h5>
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
//                   onChange={e => setCommentInput(e.target.value)}
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



import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import Breadcrumbs from '../Breadcrumbs';
import commonData from '../../data/commonData.json';

// Utility function to convert month number to month name
const getMonthName = (monthNumber) => {
  const date = new Date();
  date.setMonth(monthNumber - 1); // Month is 0-indexed for Date object
  return date.toLocaleString('en-US', { month: 'long' });
};

const AccountLevel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tableRef = useRef(null);

  // UI state
  const [accounts, setAccounts] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [activeMonthName, setActiveMonthName] = useState(null); // Added state for month name

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
    const fetchAccountData = async (month, year, monthNameParam) => { // Added monthNameParam
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(`${BACKEND_URL}/api/account`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ month, year, monthNameParam }) // Pass monthNameParam here
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
    // We will derive monthName directly from 'm' if it's available
    let mn = null;

    if (!m || !y) {
      const sm = sessionStorage.getItem('lastFetchedAccountMonth');
      const sy = sessionStorage.getItem('lastFetchedAccountYear');
      if (sm && sy) {
        m = +sm;
        y = +sy;
      }
    }

    if (m && y) {
      // Derive monthName from the numerical month
      mn = getMonthName(m);

      if (m !== activeMonth || y !== activeYear || accounts.length === 0) {
        setActiveMonth(m);
        setActiveYear(y);
        setActiveMonthName(mn); // Set the derived month name
        sessionStorage.setItem('lastFetchedAccountMonth', m.toString());
        sessionStorage.setItem('lastFetchedAccountYear', y.toString());

        fetchAccountData(m, y, mn); // Pass the derived month name to the fetch function
      }
    } else {
      setError('Missing month or year. Please go back.');
      setLoading(false);
    }
  }, [location.state, activeMonth, activeYear, accounts.length]); // Dependencies unchanged as month name is derived

  // 2) Initialize & destroy DataTable
  useEffect(() => {
    if (!loading && accounts.length > 0 && tableRef.current) {
      const $tbl = $(tableRef.current);
      if ($.fn.DataTable.isDataTable($tbl)) {
        $tbl.DataTable().destroy();
      }
      $tbl.DataTable({
        paging: true,
        searching: true,
        ordering: true,
        info: true,
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
        accId: currentAccountId,
        month: activeMonth,
        year: activeYear,
        comment: commentInput
      };
      const resp = await fetch(`${BACKEND_URL}/api/account/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
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
        background: 'linear-gradient(to bottom right, #f5f7fa, #e9ecef)',
        fontFamily: "'Poppins', sans-serif'"
      }}
    >
      <div
        className="card shadow p-4 p-md-5 w-100"
        style={{
          maxWidth: '1100px',
          backgroundColor: '#ffffffdd',
          borderRadius: '1rem'
        }}
      >
        <Breadcrumbs path={breadcrumbPath} />
        <h2 className="text-center mb-4 fw-semibold text-dark">
          🏢 Account Level Overview
          {activeMonthName && activeYear && ( // Display month name and year
            <span className="ms-2 text-primary">({activeMonthName} {activeYear})</span>
          )}
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
                    <td>{formatCurrency(acc.forecastNetRevenue)}</td>
                    <td>{formatCurrency(acc.difference)}</td>
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
                              month: activeMonth,
                              year: activeYear,
                              monthName: activeMonthName // Pass the month name to project level
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
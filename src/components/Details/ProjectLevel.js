import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
// Assuming Breadcrumbs and commonData are available in the correct relative paths
// import Breadcrumbs from '../Breadcrumbs'; // Uncomment if you have this component
// import commonData from '../../data/commonData.json'; // Uncomment if you have this file

const ProjectLevel = () => {
  const navigate = useNavigate();
  const { accountId: urlAccountId } = useParams();
  const location = useLocation();
  const tableRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [activeAccountName, setActiveAccountName] = useState('Loading...');

  // Backend URL for API calls
  const BACKEND_URL = 'http://localhost:8081';

  // Mock commonData and Breadcrumbs if not available, for standalone execution
  // In a real project, ensure these imports are correct.
  const commonData = {
    currencySettings: {
      locale: 'en-US',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  };

  const Breadcrumbs = ({ path }) => (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="breadcrumb">
        {path.map((item, index) => (
          <li key={index} className={`breadcrumb-item ${index === path.length - 1 ? 'active' : ''}`}>
            {item.page ? (
              <a href={`#${item.page}`} className="text-decoration-none text-primary">
                {item.name}
              </a>
            ) : (
              item.name
            )}
          </li>
        ))}
      </ol>
    </nav>
  );


  // Currency formatting function
  const formatCurrency = (value = 0) =>
    value.toLocaleString(commonData.currencySettings.locale, {
      style: 'currency',
      currency: commonData.currencySettings.currency,
      minimumFractionDigits: commonData.currencySettings.minimumFractionDigits,
      maximumFractionDigits: commonData.currencySettings.maximumFractionDigits
    });

  // Placeholder download logic
  const handleDownloadData = () => {
    // In a real application, replace this with actual CSV/Excel download logic
    console.log('Download Project Data button clicked!');
    // Example: Trigger a backend endpoint to generate and download a file
    // window.open(`${BACKEND_URL}/api/download-projects?month=${activeMonth}&year=${activeYear}&accountId=${activeAccountId}`);
  };

  // Load Poppins font from Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Poppins', sans-serif";
  }, []);

  // Fetch project data when context (month, year, accountId) changes
  useEffect(() => {
    const fetchProjectData = async (month, year, accId) => {
      setLoading(true);
      setError(null);

      try {
        const resp = await fetch(`${BACKEND_URL}/api/project`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // IMPORTANT: Added projectType to the request body as per API requirement
          body: JSON.stringify({ month, year, accId, projectType: "BTM" })
        });

        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`status: ${resp.status}, message: ${errText || resp.statusText}`);
        }

        const data = await resp.json();
        // Ensure data is always an array for consistent processing
        const list = Array.isArray(data) ? data : [data].filter(Boolean);
        setProjects(list);

        // Derive accountName from response or sessionStorage
        if (list.length > 0 && list[0].accountName) {
          setActiveAccountName(list[0].accountName);
        } else {
          const storedName = sessionStorage.getItem('lastFetchedProjectAccountName');
          setActiveAccountName(storedName || accId); // Fallback to accountId if name not found
        }
      } catch (e) {
        console.error('Error fetching project data:', e);
        setError(`Failed to load project data: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Determine context from location.state, URL params, or sessionStorage
    let monthToUse = location.state?.month;
    let yearToUse = location.state?.year;
    let accountIdToUse = urlAccountId; // From URL params
    let accountNameToUse = location.state?.accountName;

    // If context is missing from location.state, try sessionStorage
    if (!monthToUse || !yearToUse || !accountIdToUse) {
      const sm = sessionStorage.getItem('lastFetchedProjectMonth');
      const sy = sessionStorage.getItem('lastFetchedProjectYear');
      const sa = sessionStorage.getItem('lastFetchedProjectAccountId');
      const san = sessionStorage.getItem('lastFetchedProjectAccountName');

      if (sm && sy && sa) {
        monthToUse = parseInt(sm, 10);
        yearToUse = parseInt(sy, 10);
        accountIdToUse = sa;
        accountNameToUse = san;
      }
    }

    // Only fetch data if all necessary context is available and it's a new context
    if (monthToUse && yearToUse && accountIdToUse) {
      if (
        monthToUse !== activeMonth ||
        yearToUse !== activeYear ||
        accountIdToUse !== activeAccountId ||
        projects.length === 0 // Re-fetch if projects array is empty (e.g., first load)
      ) {
        setActiveMonth(monthToUse);
        setActiveYear(yearToUse);
        setActiveAccountId(accountIdToUse);
        if (accountNameToUse) {
          setActiveAccountName(accountNameToUse);
        }

        // Persist context to sessionStorage for future loads
        sessionStorage.setItem('lastFetchedProjectMonth', monthToUse.toString());
        sessionStorage.setItem('lastFetchedProjectYear', yearToUse.toString());
        sessionStorage.setItem('lastFetchedProjectAccountId', accountIdToUse);
        if (accountNameToUse) {
          sessionStorage.setItem('lastFetchedProjectAccountName', accountNameToUse);
        }

        fetchProjectData(monthToUse, yearToUse, accountIdToUse);
      } else {
        // If context hasn't changed and projects are already loaded, just set loading to false
        setLoading(false);
      }
    } else {
      // If essential context is missing, show an error
      setError('Missing project context (month, year, or account ID). Please go back.');
      setLoading(false);
    }
  }, [
    location.state,
    urlAccountId,
    activeMonth,
    activeYear,
    activeAccountId,
    projects.length // Include projects.length to trigger re-fetch if data is cleared
  ]);

  // Initialize and destroy DataTable when projects data changes or component unmounts
  useEffect(() => {
    if (!loading && projects.length > 0 && tableRef.current) {
      const $tbl = $(tableRef.current);
      // Destroy existing DataTable instance if it exists
      if ($.fn.DataTable.isDataTable($tbl)) {
        $tbl.DataTable().destroy();
      }
      // Initialize new DataTable instance
      $tbl.DataTable({
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: false,
        // Responsive options for DataTables (requires DataTables Responsive extension)
        // responsive: true
      });
    }

    // Cleanup function to destroy DataTable when component unmounts or dependencies change
    return () => {
      if (tableRef.current) {
        const $tbl = $(tableRef.current);
        if ($.fn.DataTable.isDataTable($tbl)) {
          $tbl.DataTable().destroy();
        }
      }
    };
  }, [loading, projects]); // Re-run effect when loading or projects data changes

  // Define breadcrumb path for navigation
  const breadcrumbPath = [
    { name: 'PMO Dashboard', page: '' },
    { name: 'Revenue Forecast - Early View', page: 'upload' },
    { name: 'Account Level', page: 'accounts' },
    {
      name: `Projects (${activeAccountName})`,
      page: `accounts/${activeAccountId}/projects`
    }
  ];

  // Render loading state
  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="ms-3 text-primary">Loading Project Data...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-danger">
        <p className="fs-4">Error: {error}</p>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate('/accounts')} // Navigate back to account level
        >
          Go to Account Level
        </button>
      </div>
    );
  }

  // Main component render
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
          maxWidth: '1200px',
          backgroundColor: '#ffffffdd',
          borderRadius: '1rem'
        }}
      >
        {/* Breadcrumbs component */}
        <Breadcrumbs path={breadcrumbPath} />

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 fw-semibold text-dark">
            📁 Project Level Overview{' '}
            {activeAccountId ? `for ${activeAccountName}` : ''}
          </h2>
          {/* Download button, visible only if projects are loaded */}
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

        {/* Responsive table container */}
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
                {/* <th>Account ID</th>
                <th>Account Name</th> */}
                <th>Total Associates</th>
                <th>Company Hours</th>
                <th>Client Hours</th>
                <th>Variance Hours</th>
                <th>Revenue</th>
                <th className="text-center">View</th>
              </tr>
            </thead>
            <tbody>
              {/* Map through projects data to render table rows */}
              {projects.map(project => (
                <tr key={project.projectId}>
                  <td>{project.projectId}</td>
                  <td>{project.projectName}</td>
                  {/* <td>{project.accountId}</td>
                  <td>{project.accountName}</td> */}
                  <td>{project.totalAssociatesCount}</td>
                  <td>{project.totalCompanyHours}</td>
                  <td>{project.totalClientHours}</td>
                  <td>{project.varianceHours}</td>
                  <td>{formatCurrency(project.revenue)}</td>
                  <td className="text-center">
                    {/* Button to navigate to Associate Level details */}
                    <button
                      className="btn btn-sm btn-outline-primary rounded-circle"
                      onClick={() =>
                        navigate(
                          `/projects/${project.projectId}/associates`,
                          {
                            state: {
                              projectId: project.projectId,
                              projectName: project.projectName,
                              accountId: project.accountId,
                              accountName: project.accountName,
                              month: activeMonth,
                              year: activeYear
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

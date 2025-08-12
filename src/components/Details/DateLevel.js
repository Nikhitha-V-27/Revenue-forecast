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
  const dataTableInstance = useRef(null); // Ref to hold the DataTable instance

  const [dailyHours, setDailyHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active context states, initialized to null or 'Loading...' for immediate feedback
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeProjectName, setActiveProjectName] = useState('Loading...');
  const [activeAssociateId, setActiveAssociateId] = useState(null);
  const [activeAssociateName, setActiveAssociateName] = useState('Loading...');
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [activeAccountName, setActiveAccountName] = useState('Loading...');
  const [activeSbu, setActiveSbu] = useState(null);
  const [activeProjectType, setActiveProjectType] = useState(null);

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

  // Effect to determine context from various sources and trigger data fetch
  useEffect(() => {
    const fetchDailyHoursData = async (month, year, projId, assocId, currentProjectName, currentAssociateName, currentAccountName, currentAccountId) => {
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

        // Update ProjectName, AssociateName, AccountName from fetched data if more specific,
        // otherwise retain values passed from navigation/session storage.
        if (list.length > 0) {
          setActiveProjectName(list[0].projectName || currentProjectName || projId);
          setActiveAssociateName(list[0].associateName || currentAssociateName || assocId);
          setActiveAccountName(list[0].accountName || currentAccountName || 'Unknown Account');
          setActiveAccountId(list[0].accountId || currentAccountId);
        } else {
          // If no data, ensure names are still set to the best available context or 'N/A'
          setActiveProjectName(currentProjectName || 'N/A');
          setActiveAssociateName(currentAssociateName || 'N/A');
          setActiveAccountName(currentAccountName || 'N/A');
          setActiveAccountId(currentAccountId); // Keep account ID from context
        }
      } catch (err) {
        console.error('Error fetching daily hours data:', err);
        setError(`Failed to load daily hours data: ${err.message}`);
        setActiveProjectName('Error');
        setActiveAssociateName('Error');
        setActiveAccountName('Error');
      } finally {
        setLoading(false);
      }
    };

    // Derive values from location.state, URL params, or sessionStorage
    let monthToUse = location.state?.month || sessionStorage.getItem('lastFetchedDateMonth');
    let yearToUse = location.state?.year || sessionStorage.getItem('lastFetchedDateYear');
    let projectIdToUse = urlProjectId || sessionStorage.getItem('lastFetchedDateProjectId');
    let associateIdToUse = urlAssociateId || sessionStorage.getItem('lastFetchedDateAssociateId');
    let projectNameToUse = location.state?.projectName || sessionStorage.getItem('lastFetchedDateProjectName');
    let associateNameToUse = location.state?.associateName || sessionStorage.getItem('lastFetchedDateAssociateName');
    let accountIdToUse = location.state?.accountId || sessionStorage.getItem('lastFetchedDateAccountId');
    let accountNameToUse = location.state?.accountName || sessionStorage.getItem('lastFetchedDateAccountName');
    let sbuToUse = location.state?.sbu || sessionStorage.getItem('lastFetchedDateSbu');
    let projectTypeToUse = location.state?.projectType || sessionStorage.getItem('lastFetchedDateProjectType');

    // Convert numeric values to integers
    monthToUse = monthToUse ? parseInt(monthToUse, 10) : null;
    yearToUse = yearToUse ? parseInt(yearToUse, 10) : null;

    // Update active states immediately. This makes sure breadcrumbs have values
    // as soon as possible, even before the data fetch completes.
    setActiveMonth(monthToUse);
    setActiveYear(yearToUse);
    setActiveProjectId(projectIdToUse);
    setActiveAssociateId(associateIdToUse);
    // Use the derived names for initial state, falling back to 'Loading...' or context
    setActiveProjectName(projectNameToUse || 'Loading...');
    setActiveAssociateName(associateNameToUse || 'Loading...');
    setActiveAccountId(accountIdToUse);
    setActiveAccountName(accountNameToUse || 'Loading...');
    setActiveSbu(sbuToUse);
    setActiveProjectType(projectTypeToUse);

    // Persist context to sessionStorage for future loads
    if (monthToUse) sessionStorage.setItem('lastFetchedDateMonth', monthToUse.toString());
    if (yearToUse) sessionStorage.setItem('lastFetchedDateYear', yearToUse.toString());
    if (projectIdToUse) sessionStorage.setItem('lastFetchedDateProjectId', projectIdToUse);
    if (associateIdToUse) sessionStorage.setItem('lastFetchedDateAssociateId', associateIdToUse);
    if (projectNameToUse) sessionStorage.setItem('lastFetchedDateProjectName', projectNameToUse);
    if (associateNameToUse) sessionStorage.setItem('lastFetchedDateAssociateName', associateNameToUse);
    if (accountIdToUse) sessionStorage.setItem('lastFetchedDateAccountId', accountIdToUse);
    if (accountNameToUse) sessionStorage.setItem('lastFetchedDateAccountName', accountNameToUse);
    if (sbuToUse) {
      sessionStorage.setItem('lastFetchedDateSbu', sbuToUse);
    }
    if (projectTypeToUse) {
      sessionStorage.setItem('lastFetchedDateProjectType', projectTypeToUse);
    }

    // Only fetch data if all necessary core context is available
    const contextChanged =
      monthToUse !== activeMonth ||
      yearToUse !== activeYear ||
      projectIdToUse !== activeProjectId ||
      associateIdToUse !== activeAssociateId ||
      accountIdToUse !== activeAccountId || // Also check accountId changes
      sbuToUse !== activeSbu || // Also check SBU changes
      projectTypeToUse !== activeProjectType; // Also check Project Type changes

    if (monthToUse && yearToUse && projectIdToUse && associateIdToUse && projectNameToUse && associateNameToUse && accountIdToUse && accountNameToUse) {
      if (contextChanged || dailyHours.length === 0) { // Re-fetch if context changed or data is empty
        fetchDailyHoursData(monthToUse, yearToUse, projectIdToUse, associateIdToUse, projectNameToUse, associateNameToUse, accountNameToUse, accountIdToUse);
      } else {
        setLoading(false); // Context hasn't changed, data already loaded
      }
    } else {
      setError('Missing daily hours context. Please go back and select an associate.');
      setLoading(false);
    }
  }, [
    location.state,
    urlProjectId,
    urlAssociateId,
    // Include all 'active' context states that drive the fetch logic in dependencies
    activeMonth,
    activeYear,
    activeProjectId,
    activeAssociateId,
    activeAccountId, // Important: Include if it affects data fetching or the fetch trigger
    activeSbu, // Important: Include if it affects data fetching or the fetch trigger
    activeProjectType, // Important: Include if it affects data fetching or the fetch trigger
    dailyHours.length // Keep this if you want to re-fetch if data array becomes empty
  ]);

  // Initialize DataTable once and update data when it changes
  useEffect(() => {
    const tableEl = tableRef.current;

    if (tableEl && !dataTableInstance.current) { // Initialize only if not already initialized
      dataTableInstance.current = $(tableEl).DataTable({
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: false,
        data: dailyHours, // Initial data
        columns: [
          { data: 'date' },
          { data: 'associateId' },
          { data: 'associateName' },
          { data: 'projectId' },
          { data: 'projectName' },
          { data: 'companyHours' },
          { data: 'clientHours' },
          { // Custom rendering for Variance Time Units
            data: 'varianceTimeUnits',
            render: function (data, type, row) {
              // Calculate variance if varianceTimeUnits is null/undefined
              const variance = data != null ? data : row.companyHours - row.clientHours;
              let className = '';
              if (variance > 0) {
                className = 'text-danger';
              } else if (variance < 0) {
                className = 'text-primary';
              } else {
                className = 'text-success';
              }
              return `<span class="fw-semibold ${className}">${variance}</span>`;
            }
          },
          { data: 'comparisonResult' }
        ]
      });
    } else if (dataTableInstance.current && !loading) {
      // Update data if DataTable is already initialized and loading is complete
      dataTableInstance.current.clear().rows.add(dailyHours).draw();
    }

    // Cleanup function to destroy DataTable when component unmounts
    return () => {
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
        dataTableInstance.current = null;
      }
    };
  }, [loading, dailyHours]); // Dependencies for DataTable effect

  // Define breadcrumb path for navigation
  const breadcrumbPath = [
    { name: 'PMO Dashboard', page: '' },
    { name: 'Revenue Forecast - Early View', page: 'upload' },
    // Conditionally add SBU Level
    ...(activeSbu ? [{ name: `${activeSbu} SBU Level`, page: 'sbu', state: { month: activeMonth, year: activeYear, sbu: activeSbu } }] : []),
    // Account Level breadcrumb
    { name: 'Account Level', page: `accounts`, state: { month: activeMonth, year: activeYear, sbu: activeSbu } },
    // Conditionally add Project Type breadcrumb
    ...(activeProjectType ? [{ name: `${activeProjectType} Project Type`, page: `accounts/${activeAccountId}/project-types`, state: { month: activeMonth, year: activeYear, sbu: activeSbu, accId: activeAccountId } }] : []),
    // Project Level breadcrumb, passing all necessary state back
    {
      name: `Project Level (${activeAccountName || 'Loading...'})`, // Ensure activeAccountName is used
      page: `accounts/${activeAccountId}/projects`,
      state: {
        month: activeMonth,
        year: activeYear,
        sbu: activeSbu,
        accId: activeAccountId,
        accountName: activeAccountName,
        projectType: activeProjectType
      }
    },
    // Associate Level breadcrumb, passing all necessary state back
    {
      name: `Associates (${activeProjectName || 'Loading...'})`, // Ensure activeProjectName is used
      page: `projects/${activeProjectId}/associates`,
      state: {
        month: activeMonth,
        year: activeYear,
        projectId: activeProjectId,
        projectName: activeProjectName,
        accountId: activeAccountId,
        accountName: activeAccountName,
        sbu: activeSbu,
        projectType: activeProjectType
      }
    },
    // Current page breadcrumb
    {
      name: `Daily View (${activeAssociateName || 'Loading...'})`, // Ensure activeAssociateName is used
      page: `projects/${activeProjectId}/associates/${activeAssociateId}/daily`
    }
  ].filter(Boolean); // Filter out any null/undefined entries

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
          onClick={() => navigate(`/projects/${activeProjectId}/associates`, {
            state: {
              month: activeMonth,
              year: activeYear,
              projectId: activeProjectId,
              projectName: activeProjectName,
              accountId: activeAccountId,
              accountName: activeAccountName,
              sbu: activeSbu,
              projectType: activeProjectType
            }
          })}
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
            <thead>
              <tr
                style={{
                  background: 'linear-gradient(to right, #60a5fa, #3b82f6)',
                  color: 'white'
                }}
              >
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
              {/* DataTables will manage rendering the tbody content, so this map is removed */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DateLevel;

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import Breadcrumbs from '../Breadcrumbs';
import commonData from '../../data/commonData.json';

// Declare the BACKEND_URL constant at the top level
const BACKEND_URL = 'http://localhost:8081';

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
  const [activeSbu, setActiveSbu] = useState(null);
  const [activeProjectType, setActiveProjectType] = useState(null);

  // State to manage column filters
  const [columnFilters, setColumnFilters] = useState({});

  // Currency formatting function
  const formatCurrency = (value = 0) =>
    value.toLocaleString(commonData.currencySettings.locale, {
      style: 'currency',
      currency: commonData.currencySettings.currency,
      minimumFractionDigits: commonData.currencySettings.minimumFractionDigits,
      maximumFractionDigits: commonData.currencySettings.maximumFractionDigits
    });

  // Utility to get month name (for file naming)
  const getMonthName = (monthNumber) => {
    if (!monthNumber) return '';
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };

  /**
   * Handles the "Download Data" button click.
   * Generates a CSV file from the 'projects' data and triggers a download.
   */
  const handleDownloadData = () => {
    if (projects.length === 0) {
      console.log('No data to download.');
      return;
    }

    // Define CSV headers matching the table columns
    const headers = [
      "Project ID", "Project Name", "Total Associates", "Company Hours",
      "Client Hours", "Variance Hours", "Revenue"
    ];

    // Map projects data to CSV rows, using the currently filtered projects
    const csvRows = applyFilters(projects, columnFilters).map(project => {
      return [
        `"${project.projectId}"`,
        `"${project.projectName}"`,
        project.totalAssociatesCount,
        project.totalCompanyHours,
        project.totalClientHours,
        project.varianceHours,
        `"${formatCurrency(project.revenue)}"`
      ].join(',');
    });

    const csvContent = [
      headers.join(','),
      ...csvRows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const monthName = getMonthName(activeMonth);
    const fileName = `Projects_Account_${activeAccountId}_${monthName}_${activeYear}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Generates a unique list of options for a given column key.
   * @param {string} columnKey The key of the column to get unique values for.
   * @returns {string[]} An array of unique values, including an 'All' option.
   */
  const getUniqueOptions = (columnKey) => {
    // Only use the raw projects data to get the full list of options
    const options = projects.map(project => project[columnKey]);
    const uniqueOptions = [...new Set(options)].sort();
    return ['All', ...uniqueOptions];
  };

  /**
   * Handles changes to a column's filter dropdown.
   * Updates the `columnFilters` state with the new value.
   * @param {string} columnKey The key of the column being filtered.
   * @param {string} value The selected filter value.
   */
  const handleFilterChange = (columnKey, value) => {
    setColumnFilters(prevFilters => ({
      ...prevFilters,
      [columnKey]: value === 'All' ? null : value
    }));
  };

  /**
   * Filters the projects array based on the current columnFilters state.
   * This is used for the download functionality to get the currently filtered data.
   * DataTables handles the actual table filtering.
   * @param {Array} projectsArray The array of projects to filter.
   * @param {Object} filters The object containing column filters.
   * @returns {Array} The filtered array of projects.
   */
  const applyFilters = (projectsArray, filters) => {
    return projectsArray.filter(project => {
      return Object.keys(filters).every(columnKey => {
        const filterValue = filters[columnKey];
        if (filterValue === null || filterValue === undefined) {
          return true; // No filter applied for this column
        }

        const projectValue = project[columnKey];
        if (projectValue === null || projectValue === undefined) {
          return false; // Cannot match if project value is null/undefined
        }

        // Handle numeric and string comparisons
        if (typeof projectValue === 'number' && !Number.isNaN(Number(filterValue))) {
          // Strict equality for numbers
          return projectValue === Number(filterValue);
        }

        // Case-insensitive string comparison for others
        return String(projectValue).toLowerCase() === String(filterValue).toLowerCase();
      });
    });
  };

  // Load Poppins font from Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Poppins', sans-serif";
  }, []);

  // Fetch project data when context (month, year, accountId, projectType) changes
  useEffect(() => {
    const fetchProjectData = async (month, year, accId, projectType) => {
      setLoading(true);
      setError(null);

      try {
        const payload = { month, year, accId, projectType };
        const resp = await fetch(`${BACKEND_URL}/api/project`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`status: ${resp.status}, message: ${errText || resp.statusText}`);
        }

        const data = await resp.json();
        const list = Array.isArray(data) ? data : [data].filter(Boolean);
        setProjects(list);
        setColumnFilters({}); // Reset filters when new data is fetched

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

    let monthToUse = location.state?.month;
    let yearToUse = location.state?.year;
    let accountIdToUse = urlAccountId;
    let accountNameToUse = location.state?.accountName;
    let sbuToUse = location.state?.sbu;
    let projectTypeToUse = location.state?.projectType;

    if (!monthToUse) monthToUse = sessionStorage.getItem('lastFetchedProjectMonth');
    if (!yearToUse) yearToUse = sessionStorage.getItem('lastFetchedProjectYear');
    if (!accountNameToUse) accountNameToUse = sessionStorage.getItem('lastFetchedProjectAccountName');
    if (!sbuToUse) sbuToUse = sessionStorage.getItem('lastFetchedProjectSbu');
    if (!projectTypeToUse) projectTypeToUse = sessionStorage.getItem('lastFetchedProjectType');

    monthToUse = monthToUse ? parseInt(monthToUse, 10) : null;
    yearToUse = yearToUse ? parseInt(yearToUse, 10) : null;

    if (monthToUse && yearToUse && accountIdToUse) {
      if (
        monthToUse !== activeMonth ||
        yearToUse !== activeYear ||
        accountIdToUse !== activeAccountId ||
        sbuToUse !== activeSbu ||
        projectTypeToUse !== activeProjectType
      ) {
        setActiveMonth(monthToUse);
        setActiveYear(yearToUse);
        setActiveAccountId(accountIdToUse);
        if (accountNameToUse) {
          setActiveAccountName(accountNameToUse);
        }
        setActiveSbu(sbuToUse);
        setActiveProjectType(projectTypeToUse);

        sessionStorage.setItem('lastFetchedProjectMonth', monthToUse.toString());
        sessionStorage.setItem('lastFetchedProjectYear', yearToUse.toString());
        sessionStorage.setItem('lastFetchedProjectAccountId', accountIdToUse);
        if (accountNameToUse) {
          sessionStorage.setItem('lastFetchedProjectAccountName', accountNameToUse);
        }
        if (sbuToUse) {
          sessionStorage.setItem('lastFetchedProjectSbu', sbuToUse);
        }
        if (projectTypeToUse) {
          sessionStorage.setItem('lastFetchedProjectType', projectTypeToUse);
        }

        fetchProjectData(monthToUse, yearToUse, accountIdToUse, projectTypeToUse);
      } else {
        setLoading(false);
      }
    } else {
      setError('Missing month, year, or Account ID. Please navigate here with all parameters.');
      setLoading(false);
    }
  }, [
    location.state,
    urlAccountId,
    activeMonth,
    activeYear,
    activeAccountId,
    activeSbu,
    activeProjectType
  ]);

  // useEffect to handle DataTables initialization and destruction
  useEffect(() => {
    if (!loading && projects.length > 0 && tableRef.current) {
      const $tbl = $(tableRef.current);
      if ($.fn.DataTable.isDataTable($tbl)) {
        $tbl.DataTable().destroy();
      }

      // Initialize DataTable
      const tableInstance = $tbl.DataTable({
        paging: true,
        searching: true, // Keep this for the global search bar
        ordering: false, // Disabling default ordering as per original code
        info: true,
        autoWidth: false
      });

      // Store the DataTables instance on the ref for later access
      tableRef.current.dataTableInstance = tableInstance;
    }

    // Cleanup function: destroy DataTable when component unmounts or data changes
    return () => {
      if (tableRef.current && tableRef.current.dataTableInstance) {
        tableRef.current.dataTableInstance.destroy();
        tableRef.current.dataTableInstance = null;
      }
    };
  }, [loading, projects]); // Re-run when loading state or projects data changes

  // New useEffect to apply filters using DataTables API
  useEffect(() => {
    if (tableRef.current && tableRef.current.dataTableInstance) {
      const tableInstance = tableRef.current.dataTableInstance;

      // Clear all column-specific searches first to prevent cumulative filtering
      tableInstance.columns().search('');

      // Define a mapping from column keys (used in state) to DataTables column indices
      const columnMapping = {
        projectId: 0,
        projectName: 1,
        totalAssociatesCount: 2,
        totalCompanyHours: 3,
        totalClientHours: 4,
        varianceHours: 5,
        revenue: 6,
      };

      // Apply filters for each column based on the columnFilters state
      Object.keys(columnFilters).forEach(columnKey => {
        const filterValue = columnFilters[columnKey];
        if (filterValue !== null) {
          const columnIndex = columnMapping[columnKey];
          if (columnIndex !== undefined) {
            // DataTables search method requires a regex-like string for exact match
            // Using "^" and "$" ensures an exact match for the cell content
            tableInstance.column(columnIndex).search(`^${filterValue}$`, true, false);
          }
        }
      });

      // Redraw the table to apply all set filters
      tableInstance.draw();
    }
  }, [columnFilters]); // Re-run this effect whenever columnFilters state changes


  // Define breadcrumb path for navigation
  const breadcrumbPath = [
    { name: 'PMO Dashboard', page: '' },
    { name: 'Revenue Forecast - Early View', page: 'upload' },
    ...(activeSbu ? [{ name: `${activeSbu} SBU Level`, page: 'sbu', state: { month: activeMonth, year: activeYear, sbu: activeSbu } }] : []),
    { name: 'Account Level', page: `accounts`, state: { month: activeMonth, year: activeYear, sbu: activeSbu } },
    ...(activeProjectType ? [{ name: `${activeProjectType} Project Type`, page: `accounts/${activeAccountId}/project-types`, state: { month: activeMonth, year: activeYear, sbu: activeSbu, accId: activeAccountId } }] : []),
    {
      name: `Projects (${activeAccountName})`,
      page: `accounts/${activeAccountId}/projects`
    }
  ].filter(Boolean);

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
          onClick={() => navigate('/accounts', { state: { month: activeMonth, year: activeYear, sbu: activeSbu } })}
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
                {/* Each header now includes a filter dropdown */}
                <th>
                  Project ID
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) => handleFilterChange('projectId', e.target.value)}
                    value={columnFilters.projectId || 'All'}
                  >
                    {getUniqueOptions('projectId').map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </th>
                <th>
                  Project Name
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) => handleFilterChange('projectName', e.target.value)}
                    value={columnFilters.projectName || 'All'}
                  >
                    {getUniqueOptions('projectName').map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </th>
                <th>
                  Total Associates
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) => handleFilterChange('totalAssociatesCount', e.target.value)}
                    value={columnFilters.totalAssociatesCount || 'All'}
                  >
                    {getUniqueOptions('totalAssociatesCount').map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </th>
                <th>Company Hours
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) => handleFilterChange('totalCompanyHours', e.target.value)}
                    value={columnFilters.totalCompanyHours || 'All'}
                  >
                    {getUniqueOptions('totalCompanyHours').map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </th>
                <th>Client Hours
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) => handleFilterChange('totalClientHours', e.target.value)}
                    value={columnFilters.totalClientHours || 'All'}
                  >
                    {getUniqueOptions('totalClientHours').map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </th>
                <th>Variance Hours
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) => handleFilterChange('varianceHours', e.target.value)}
                    value={columnFilters.varianceHours || 'All'}
                  >
                    {getUniqueOptions('varianceHours').map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </th>
                <th>Revenue
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) => handleFilterChange('revenue', e.target.value)}
                    value={columnFilters.revenue || 'All'}
                  >
                    {getUniqueOptions('revenue').map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </th>
                <th className="text-center">View</th>
              </tr>
            </thead>
            <tbody>
              {/* Map through the projects data directly, as DataTables will handle the filtering and rendering */}
              {projects.map(project => (
                <tr key={project.projectId}>
                  <td>{project.projectId}</td>
                  <td>{project.projectName}</td>
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
                              projectId: project.projectId,
                              projectName: project.projectName,
                              accountId: project.accountId,
                              accountName: project.accountName,
                              month: activeMonth,
                              year: activeYear,
                              sbu: activeSbu,
                              projectType: activeProjectType
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

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import Breadcrumbs from '../Breadcrumbs'; // Assuming this path is correct
import commonData from '../../data/commonData.json'; // Assuming this path is correct

const ProjectLevel = () => {
  const navigate = useNavigate();
  const { accountId: urlAccountId } = useParams(); // accountId from URL path
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


  // Backend URL for API calls
  const BACKEND_URL = 'http://localhost:8081';

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

    // Map project data to CSV rows
    const csvRows = projects.map(project => {
      return [
        `"${project.projectId}"`, // Enclose in quotes to handle commas if any
        `"${project.projectName}"`,
        project.totalAssociatesCount,
        project.totalCompanyHours,
        project.totalClientHours,
        project.varianceHours,
        `"${formatCurrency(project.revenue)}"` // Format currency and enclose in quotes
      ].join(','); // Join values with a comma
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','), // Join headers with a comma
      ...csvRows
    ].join('\n'); // Join rows with a newline character

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a download link and trigger the download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Generate a dynamic filename
    const monthName = getMonthName(activeMonth);
    const fileName = `Projects_Account_${activeAccountId}_${monthName}_${activeYear}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden'; // Hide the link
    document.body.appendChild(link); // Append to body
    link.click(); // Programmatically click the link to trigger download
    document.body.removeChild(link); // Clean up
    URL.revokeObjectURL(url); // Release the object URL
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
    let accountIdToUse = urlAccountId; // Always from URL params for this component
    let accountNameToUse = location.state?.accountName;
    let sbuToUse = location.state?.sbu;
    let projectTypeToUse = location.state?.projectType;

    // Prioritize sessionStorage for all parameters if not in location.state
    // This makes the context retrieval more robust
    if (!monthToUse) monthToUse = sessionStorage.getItem('lastFetchedProjectMonth');
    if (!yearToUse) yearToUse = sessionStorage.getItem('lastFetchedProjectYear');
    // accountIdToUse is primarily from useParams (urlAccountId)
    if (!accountNameToUse) accountNameToUse = sessionStorage.getItem('lastFetchedProjectAccountName');
    if (!sbuToUse) sbuToUse = sessionStorage.getItem('lastFetchedProjectSbu');
    if (!projectTypeToUse) projectTypeToUse = sessionStorage.getItem('lastFetchedProjectType');

    // Convert to number
    monthToUse = monthToUse ? parseInt(monthToUse, 10) : null;
    yearToUse = yearToUse ? parseInt(yearToUse, 10) : null;

    // Only fetch data if all necessary context is available and it's a new context
    if (monthToUse && yearToUse && accountIdToUse) {
      if (
        monthToUse !== activeMonth ||
        yearToUse !== activeYear ||
        accountIdToUse !== activeAccountId ||
        sbuToUse !== activeSbu ||
        projectTypeToUse !== activeProjectType ||
        projects.length === 0 // Re-fetch if projects array is empty (e.g., first load)
      ) {
        setActiveMonth(monthToUse);
        setActiveYear(yearToUse);
        setActiveAccountId(accountIdToUse);
        if (accountNameToUse) {
          setActiveAccountName(accountNameToUse);
        }
        setActiveSbu(sbuToUse);
        setActiveProjectType(projectTypeToUse);

        // Persist context to sessionStorage for future loads
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
    activeProjectType,
    projects.length
  ]);

  // Initialize and destroy DataTable when projects data changes or component unmounts
  useEffect(() => {
    if (!loading && projects.length > 0 && tableRef.current) {
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
  }, [loading, projects]);

  // Define breadcrumb path for navigation
  const breadcrumbPath = [
    { name: 'PMO Dashboard', page: '' },
    { name: 'Revenue Forecast - Early View', page: 'upload' },
    // Conditionally add SBU Level
    ...(activeSbu ? [{ name: `${activeSbu} SBU Level`, page: 'sbu', state: { month: activeMonth, year: activeYear, sbu: activeSbu } }] : []),
    // Account Level breadcrumb
    { name: 'Account Level', page: `accounts`, state: { month: activeMonth, year: activeYear, sbu: activeSbu } },
    // Conditionally add Project Type breadcrumb (name changed to "Project Type")
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
                <th>Project ID</th>
                <th>Project Name</th>
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

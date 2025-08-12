import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Table,
  Alert,
  Spinner,
  Button
} from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../Breadcrumbs'; // Assuming this path is correct
import commonData from '../../data/commonData.json'; // Assuming this path is correct

const ProjectTypeLevel = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State variables for active filters
  const [activeAccId, setActiveAccId] = useState(null);
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [activeSbu, setActiveSbu] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Define BACKEND_URL here, inside the component
  const BACKEND_URL = 'http://localhost:8081';

  // Currency settings from commonData
  const {
    locale,
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  } = commonData.currencySettings;

  // Initialize Intl.NumberFormat for currency formatting
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  });

  // Define a map for column names to display names (camelCase to readable)
  const columnNameMap = {
    projectType: 'Project Type',
    totalRevenueByType: 'Total Revenue by Type',
    totalProjectsInType: 'Total Projects by Type',
    // Add other mappings as needed if your DTO has more fields
    // For example:
    // someOtherCamelCaseField: 'Some Other Display Field',
  };

  // Helper to format values, handling exponent strings and currency
  const formatValue = (val, columnName) => {
    if (typeof val === 'string') {
      const m = val.match(/^e(\d+)$/i); // Check for "eX" format
      if (m) {
        val = Math.pow(10, Number(m[1])); // Convert "eX" to 10^X
      } else if (!isNaN(val)) {
        val = Number(val); // Convert string numbers to actual numbers
      }
    }

    // Format as currency if it's a finite number and the specific column
    if (typeof val === 'number' && isFinite(val) && columnName === 'totalRevenueByType') {
      return formatter.format(val);
    }
    return val; // Return original value if not a number or not meant for currency formatting
  };

  // Helper to get month name from month number
  const getMonthName = (m) =>
    new Date(activeYear, m - 1).toLocaleString('en-US', { month: 'long' }); // Use activeYear here

  // Load Poppins font from Google Fonts (good practice for consistent styling)
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Poppins', sans-serif";
  }, []);

  // Fetch Project Type data when activeAccId, activeMonth, activeYear change
  useEffect(() => {
    const fetchProjectTypeData = async (accIdToUse, monthToUse, yearToUse) => {
      setLoading(true);
      setError(''); // Clear any previous errors
      try {
        const payload = {
          accId: accIdToUse,
          month: Number(monthToUse),
          year: Number(yearToUse)
        };
        const resp = await axios.post(
          `${BACKEND_URL}/api/project-type-level`, // API endpoint for Project Type data
          payload
        );
        setData(resp.data); // Set fetched data to state
      } catch (err) {
        // Handle API errors
        console.error("Error fetching Project Type data:", err);
        setError(err.response?.data || err.message || 'Failed to fetch project type data.');
      } finally {
        setLoading(false); // Deactivate loading spinner
      }
    };

    // Determine context from location.state, sessionStorage, or URL query params
    let accIdCandidate = location.state?.accId;
    let monthCandidate = location.state?.month;
    let yearCandidate = location.state?.year;
    let sbuCandidate = location.state?.sbu;

    // Fallback to sessionStorage if not in location.state
    if (!accIdCandidate) accIdCandidate = sessionStorage.getItem('lastFetchedProjectTypeAccId');
    if (!monthCandidate) monthCandidate = sessionStorage.getItem('lastFetchedProjectTypeMonth');
    if (!yearCandidate) yearCandidate = sessionStorage.getItem('lastFetchedProjectTypeYear');
    if (!sbuCandidate) sbuCandidate = sessionStorage.getItem('lastFetchedProjectTypeSbu');

    // Fallback to URL query parameters if not in sessionStorage (less common for this level, but good for robustness)
    const qs = new URLSearchParams(location.search);
    if (!accIdCandidate) accIdCandidate = qs.get('accId');
    if (!monthCandidate) monthCandidate = qs.get('month');
    if (!yearCandidate) yearCandidate = qs.get('year');
    if (!sbuCandidate) sbuCandidate = qs.get('sbu');

    // Convert numeric values to integers
    monthCandidate = monthCandidate ? parseInt(monthCandidate, 10) : null;
    yearCandidate = yearCandidate ? parseInt(yearCandidate, 10) : null;

    // Only proceed if all essential parameters are valid
    if (accIdCandidate && monthCandidate && yearCandidate) {
      // Check if context has actually changed to avoid unnecessary re-fetches
      if (
        accIdCandidate !== activeAccId ||
        monthCandidate !== activeMonth ||
        yearCandidate !== activeYear ||
        sbuCandidate !== activeSbu || // Include sbu in re-fetch condition
        data.length === 0 // Re-fetch if data is empty (e.g., first load)
      ) {
        setActiveAccId(accIdCandidate);
        setActiveMonth(monthCandidate);
        setActiveYear(yearCandidate);
        setActiveSbu(sbuCandidate);

        // Persist context to sessionStorage for future loads
        sessionStorage.setItem('lastFetchedProjectTypeAccId', accIdCandidate);
        sessionStorage.setItem('lastFetchedProjectTypeMonth', monthCandidate.toString());
        sessionStorage.setItem('lastFetchedProjectTypeYear', yearCandidate.toString());
        if (sbuCandidate) {
          sessionStorage.setItem('lastFetchedProjectTypeSbu', sbuCandidate);
        }

        fetchProjectTypeData(accIdCandidate, monthCandidate, yearCandidate);
      } else {
        setLoading(false); // Context hasn't changed, data already loaded
      }
    } else {
      // If essential context is missing after all checks, set error
      setError('Missing Account ID, month, or year. Please navigate here with those parameters.');
      setLoading(false);
    }
  }, [
    location.state,
    location.search,
    activeAccId,
    activeMonth,
    activeYear,
    activeSbu, // Add activeSbu to dependencies
    data.length,
    BACKEND_URL
  ]);

  // Dynamically determine table columns based on the first data item
  // Filters out specific fields if they are not meant for direct display
  const columns = data.length
    ? Object.keys(data[0]).filter((col) => col.toLowerCase() !== 'id' && col.toLowerCase() !== 'accountid' && col.toLowerCase() !== 'month' && col.toLowerCase() !== 'year')
    : [];

  // Map the raw column names to their display names using columnNameMap
  const mappedColumns = columns.map(col => columnNameMap[col] || col);

  // Append a 'View' column to the headers for navigation
  const headerCols = [...mappedColumns, 'View Projects'];

  // Define breadcrumb path
  const breadcrumbPath = [
    { name: 'PMO Dashboard', page: '' }, // Navigates to root (e.g., your main dashboard)
    { name: 'Revenue Forecast - Early View', page: 'upload' }, // Navigates to the upload page
    // Conditionally add SBU Level if activeSbu is available
    ...(activeSbu ? [{ name: `${activeSbu} SBU Level`, page: 'sbu', state: { month: activeMonth, year: activeYear, sbu: activeSbu } }] : []),
    // Account Level breadcrumb, passing necessary state back to AccountLevel
    { name: 'Account Level', page: `accounts`, state: { month: activeMonth, year: activeYear, sbu: activeSbu } },
    // Current page breadcrumb (name changed to "Project Type")
    { name: `Project Type`, page: `accounts/${activeAccId}/project-types` } // No need to pass state to itself here
  ].filter(Boolean); // Filter out any null/undefined entries if 'sbu' is not set

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"
      style={{
        background: 'linear-gradient(to bottom right, #f5f7fa, #e9ecef)',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        className="card shadow p-4 p-md-5 w-100"
        style={{
          maxWidth: '1100px',
          backgroundColor: '#ffffffdd',
          borderRadius: '1rem',
        }}
      >
        {/* Breadcrumbs component */}
        <Breadcrumbs path={breadcrumbPath} />

        {/* Page title */}
        <h2 className="text-center mb-4 fw-semibold text-dark">
          📊 Project Type Overview for Account {activeAccId}{' '}
          <span className="text-primary">
            ({getMonthName(activeMonth)} {activeYear})
          </span>
        </h2>

        {/* Conditional rendering for loading, error, or data display */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center my-5">
            <Spinner animation="border" role="status" className="me-2" />
            <p className="ms-3 text-primary">Loading Project Type Data...</p>
          </div>
        ) : error ? (
          <div className="d-flex flex-column justify-content-center align-items-center text-danger">
            <p className="fs-4">Error: {error}</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => navigate('/accounts', { state: { month: activeMonth, year: activeYear, sbu: activeSbu } })} // Navigate back to Account Level with state
            >
              Go to Account Level
            </button>
          </div>
        ) : (
          data.length === 0 ? (
            <div className="text-center text-muted py-5">
              <p className="fs-5">No Project Type data available for Account {activeAccId} in {getMonthName(activeMonth)} {activeYear}.</p>
              <p>Please ensure data has been uploaded for this period.</p>
            </div>
          ) : (
            <div className="table-responsive rounded">
              <Table
                hover
                bordered
                className="align-middle mb-0"
                style={{ width: '100%' }}
              >
                <thead
                  className="text-white"
                  style={{
                    background: 'linear-gradient(to right, #1d4ed8, #2563eb)',
                  }}
                >
                  <tr>
                    {headerCols.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx}>
                      {columns.map((col) => (
                        <td key={col}>{formatValue(row[col], col)}</td>
                      ))}
                      <td className="text-center">
                        {/* Button to navigate to Project Level for the specific Project Type */}
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="rounded-circle"
                          onClick={() =>
                            navigate(`/accounts/${activeAccId}/projects`, {
                              state: {
                                accId: activeAccId, // Pass activeAccId
                                month: activeMonth, // Pass activeMonth
                                year: activeYear,   // Pass activeYear
                                sbu: activeSbu,     // Pass activeSbu
                                projectType: row.projectType // Pass the project type for filtering at the Project Level
                              }
                            })
                          }
                          title={`View Projects for ${row.projectType || 'this type'}`}
                        >
                          🔍
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ProjectTypeLevel;

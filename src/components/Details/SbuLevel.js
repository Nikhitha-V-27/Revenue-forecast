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

const SbuLevel = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation directly to access state and search

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active filters state to manage month, year, etc.
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [activeMonthName, setActiveMonthName] = useState(null);


  // Backend URL for API calls
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

  // Helper to format values, handling exponent strings and currency
  const formatValue = (val) => {
    if (typeof val === 'string') {
      const m = val.match(/^e(\d+)$/i); // Check for "eX" format
      if (m) {
        val = Math.pow(10, Number(m[1])); // Convert "eX" to 10^X
      } else if (!isNaN(val)) {
        val = Number(val); // Convert string numbers to actual numbers
      }
    }

    // Format as currency if it's a finite number
    if (typeof val === 'number' && isFinite(val)) {
      return formatter.format(val);
    }
    return val; // Return original value if not a number or not for currency formatting
  };

  // Helper to get month name from month number
  const getMonthName = (m) =>
    new Date(activeYear, m - 1).toLocaleString('en-US', { month: 'long' }); // Use activeYear here

  // Fetch SBU data on component mount or when activeMonth/activeYear change
  useEffect(() => {
    const fetchSbu = async (monthToUse, yearToUse) => {
      setLoading(true);
      setError('');
      try {
        const payload = {
          month: Number(monthToUse),
          year: Number(yearToUse),
          monthNameParam: getMonthName(monthToUse).toLowerCase() // Pass month name in lowercase
        };
        const resp = await axios.post(
          `${BACKEND_URL}/api/sbu`, // API endpoint for SBU data
          payload
        );
        setData(resp.data); // Set fetched data to state
      } catch (err) {
        // Handle API errors
        console.error("Error fetching SBU data:", err);
        setError(err.response?.data || err.message || 'Failed to fetch SBU data.');
      } finally {
        setLoading(false);
      }
    };

    // Determine month and year from location state, session storage, or URL query params
    let monthCandidate = location.state?.month;
    let yearCandidate = location.state?.year;

    // Fallback to sessionStorage if not in location.state
    if (!monthCandidate) {
      monthCandidate = sessionStorage.getItem('lastFetchedSbuMonth');
    }
    if (!yearCandidate) {
      yearCandidate = sessionStorage.getItem('lastFetchedSbuYear');
    }

    // Fallback to URL query parameters if not in sessionStorage
    const qs = new URLSearchParams(location.search);
    if (!monthCandidate) {
      monthCandidate = qs.get('month');
    }
    if (!yearCandidate) {
      yearCandidate = qs.get('year');
    }

    // Convert to number
    monthCandidate = monthCandidate ? parseInt(monthCandidate, 10) : null;
    yearCandidate = yearCandidate ? parseInt(yearCandidate, 10) : null;

    // Only proceed if month and year are valid numbers
    if (monthCandidate && yearCandidate) {
      // Check if context has actually changed to avoid unnecessary re-fetches
      if (monthCandidate !== activeMonth || yearCandidate !== activeYear || data.length === 0) {
        setActiveMonth(monthCandidate);
        setActiveYear(yearCandidate);
        setActiveMonthName(getMonthName(monthCandidate)); // Set month name here

        // Persist to sessionStorage for future loads
        sessionStorage.setItem('lastFetchedSbuMonth', monthCandidate.toString());
        sessionStorage.setItem('lastFetchedSbuYear', yearCandidate.toString());

        fetchSbu(monthCandidate, yearCandidate);
      } else {
        // If context hasn't changed and data is already loaded, just set loading to false
        setLoading(false);
      }
    } else {
      // If essential context is missing after all checks, set error
      setError('Month and year missing. Please navigate here with those parameters.');
      setLoading(false);
    }
  }, [location.state, location.search, activeMonth, activeYear, data.length, BACKEND_URL]); // Dependencies for useEffect

  // Dynamically determine table columns based on the first data item
  // Filters out specific revenue fields if they are not meant for direct display
  const columns = data.length
    ? Object.keys(data[0]).filter((col) => {
        const lc = col.toLowerCase();
        return (
          lc !== 'revenue' &&
          lc !== 'sburevenue' &&
          lc !== 'totalsburevenue' &&
          lc !== 'month' && // Exclude month from columns if it's in the data
          lc !== 'year' &&  // Exclude year from columns if it's in the data
          lc !== 'monthnameparam' // Exclude monthNameParam
        );
      })
    : [];

  // Append a 'View' column to the headers for navigation
  const headerCols = [...columns, 'View Accounts'];

  // Define breadcrumb path
  const breadcrumbPath = [
    { name: 'PMO Dashboard', page: '' }, // Root of the dashboard
    // When navigating to 'upload', we don't pass state from SBU Level,
    // as 'upload' is typically where month/year are selected.
    { name: 'Revenue Forecast - Early View', page: 'upload' },
    { name: 'SBU Level', page: 'sbu' }, // Current page (no state needed for itself)
  ];

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
          📊 SBU Summary for{' '}
          <span className="text-primary">
            {activeMonthName} {activeYear} {/* Use activeMonthName and activeYear */}
          </span>
        </h2>

        {/* Conditional rendering for loading, error, or data display */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center my-5">
            <Spinner animation="border" role="status" className="me-2" />
            <p className="ms-3 text-primary">Loading SBU Data...</p>
          </div>
        ) : error ? (
          <div className="d-flex flex-column justify-content-center align-items-center text-danger">
            <p className="fs-4">Error: {error}</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => navigate('/upload')} // Navigate back to the upload/selection page
            >
              Go to Upload Page
            </button>
          </div>
        ) : (
          data.length === 0 ? (
            <div className="text-center text-muted py-5">
              <p className="fs-5">No SBU data available for {activeMonthName} {activeYear}.</p>
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
                        <td key={col}>{formatValue(row[col])}</td>
                      ))}
                      <td className="text-center">
                        {/* Button to navigate to Account Level for the specific SBU */}
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="rounded-circle"
                          onClick={() =>
                            navigate('/accounts', {
                              state: {
                                month: activeMonth, // Pass activeMonth
                                year: activeYear,   // Pass activeYear
                                sbu: row.sbuName
                              }
                            })
                          }
                          title={`View Accounts for ${row.sbuName || 'this SBU'}`}
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

export default SbuLevel;

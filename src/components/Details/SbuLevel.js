import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  Spinner,
  Button
} from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../Breadcrumbs';
import commonData from '../../data/commonData.json';

const SbuLevel = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [activeMonthName, setActiveMonthName] = useState(null);

  const BACKEND_URL = 'http://localhost:8081';

  const {
    locale,
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  } = commonData.currencySettings;

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  });

  const columnNameMap = {
    sbuName: 'SBU Name',
    totalSbuRevenue: 'Total Sbu Revenue',
    totalSbuForecast: 'Total Sbu Forecast',
    totalSbuDifference: 'Total Difference at SBU level',
    totalAccount: 'Total Account'
  };

  const formatValue = (val, columnName) => {
    if (typeof val === 'string') {
      const m = val.match(/^e(\d+)$/i);
      if (m) {
        val = Math.pow(10, Number(m[1]));
      } else if (!isNaN(val)) {
        val = Number(val);
      }
    }

    if (
      typeof val === 'number' &&
      isFinite(val) &&
      ['totalSbuRevenue', 'totalSbuForecast', 'totalSbuDifference'].includes(columnName)
    ) {
      return formatter.format(val);
    }

    return val;
  };

  const getMonthName = (m) =>
    new Date(activeYear, m - 1).toLocaleString('en-US', { month: 'long' });

  useEffect(() => {
    const fetchSbu = async (monthToUse, yearToUse) => {
      setLoading(true);
      setError('');
      try {
        const payload = {
          month: Number(monthToUse),
          year: Number(yearToUse),
          monthNameParam: getMonthName(monthToUse).toLowerCase()
        };
        const resp = await axios.post(`${BACKEND_URL}/api/sbu`, payload);

        // Add calculated difference to each item
        const enriched = resp.data.map(item => ({
          ...item,
          totalSbuDifference: item.totalSbuRevenue - item.totalSbuForecast
        }));

        setData(enriched);
      } catch (err) {
        console.error("Error fetching SBU data:", err);
        setError(err.response?.data || err.message || 'Failed to fetch SBU data.');
      } finally {
        setLoading(false);
      }
    };

    let monthCandidate = location.state?.month || sessionStorage.getItem('lastFetchedSbuMonth') || new URLSearchParams(location.search).get('month');
    let yearCandidate = location.state?.year || sessionStorage.getItem('lastFetchedSbuYear') || new URLSearchParams(location.search).get('year');

    monthCandidate = monthCandidate ? parseInt(monthCandidate, 10) : null;
    yearCandidate = yearCandidate ? parseInt(yearCandidate, 10) : null;

    if (monthCandidate && yearCandidate) {
      if (monthCandidate !== activeMonth || yearCandidate !== activeYear || data.length === 0) {
        setActiveMonth(monthCandidate);
        setActiveYear(yearCandidate);
        setActiveMonthName(getMonthName(monthCandidate));
        sessionStorage.setItem('lastFetchedSbuMonth', monthCandidate.toString());
        sessionStorage.setItem('lastFetchedSbuYear', yearCandidate.toString());
        fetchSbu(monthCandidate, yearCandidate);
      } else {
        setLoading(false);
      }
    } else {
      setError('Month and year missing. Please navigate here with those parameters.');
      setLoading(false);
    }
  }, [location.state, location.search, activeMonth, activeYear, data.length]);

  const columns = data.length
    ? (() => {
        const rawCols = Object.keys(data[0]).filter((col) => {
          const lc = col.toLowerCase();
          return (
            lc !== 'month' &&
            lc !== 'year' &&
            lc !== 'monthnameparam'
          );
        });

        if (!rawCols.includes('totalSbuDifference')) {
          const i = rawCols.indexOf('totalSbuForecast');
          if (i !== -1) {
            rawCols.splice(i + 1, 0, 'totalSbuDifference');
          } else {
            rawCols.push('totalSbuDifference');
          }
        }

        return rawCols;
      })()
    : [];

  const mappedColumns = columns.map(col => columnNameMap[col] || col);
  const headerCols = [...mappedColumns, 'View Accounts'];

  const breadcrumbPath = [
    { name: 'PMO Dashboard', page: '' },
    { name: 'Revenue Forecast - Early View', page: 'upload' },
    { name: 'SBU Level', page: 'sbu' },
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
        <Breadcrumbs path={breadcrumbPath} />

        <h2 className="text-center mb-4 fw-semibold text-dark">
          📊 SBU Summary for{' '}
          <span className="text-primary">
            {activeMonthName} {activeYear}
          </span>
        </h2>

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
              onClick={() => navigate('/upload')}
            >
              Go to Upload Page
            </button>
          </div>
        ) : data.length === 0 ? (
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
                      <td key={col}>{formatValue(row[col], col)}</td>
                    ))}
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="rounded-circle"
                        onClick={() =>
                          navigate('/accounts', {
                            state: {
                              month: activeMonth,
                              year: activeYear,
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
        )}
      </div>
    </div>
  );
};

export default SbuLevel;

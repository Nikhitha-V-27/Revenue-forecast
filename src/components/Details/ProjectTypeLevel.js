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
import Breadcrumbs from '../Breadcrumbs';
import commonData from '../../data/commonData.json';

const ProjectTypeLevel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { accId, month, year, sbu } = location.state || {};

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const formatValue = (val, columnName) => {
    if (typeof val === 'string') {
      const m = val.match(/^e(\d+)$/i);
      if (m) {
        val = Math.pow(10, Number(m[1]));
      } else if (!isNaN(val)) {
        val = Number(val);
      }
    }

    if (typeof val === 'number' && isFinite(val) && columnName === 'totalRevenueByType') {
      return formatter.format(val);
    }
    return val;
  };

  const getMonthName = (m) =>
    new Date(year, m - 1).toLocaleString('en-US', { month: 'long' });

  useEffect(() => {
    if (!accId || !month || !year) {
      setError('Missing Account ID, month, or year. Please navigate here with those parameters.');
      setLoading(false);
      return;
    }

    const fetchProjectTypeData = async () => {
      setLoading(true);
      setError('');
      try {
        const payload = {
          accId: accId,
          month: Number(month),
          year: Number(year)
        };
        const resp = await axios.post(
          'http://localhost:8081/api/project-type-level',
          payload
        );
        setData(resp.data);
      } catch (err) {
        setError(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectTypeData();
  }, [accId, month, year]);

  const columns = data.length
    ? Object.keys(data[0]).filter((col) => col.toLowerCase() !== 'id')
    : [];

  const headerCols = [...columns, 'View'];

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
        <Breadcrumbs path={[
          { name: 'SBU Level', page: 'sbu' },
          { name: 'Account Level', page: `accounts` },
          { name: 'Project Type Level', page: `accounts/${accId}/project-types` }
        ]} />

        <Button variant="link" className="ps-0 mb-4" onClick={() => navigate(-1)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-left me-2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
                 </Button>

        <h2 className="text-center mb-4 fw-semibold text-dark">
          📊 Project Type Overview for Account {accId}{' '}
          <span className="text-primary">
            ({getMonthName(month)} {year})
          </span>
        </h2>

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
              onClick={() => navigate('/accounts', { state: { month, year, sbu } })}
            >
              Go to Account Level
            </button>
          </div>
        ) : (
          <div className="table-responsive rounded">
            <table
              className="display table table-hover align-middle table-bordered mb-0"
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
                        variant="primary"
                        onClick={() =>
                          navigate(`/accounts/${accId}/projects`, {
                            state: {
                              accId,
                              month,
                              year,
                              sbu,
                              projectType: row.projectType
                            }
                          })
                        }
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTypeLevel;

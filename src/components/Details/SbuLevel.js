import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Container,
  Table,
  Alert,
  Spinner,
  Button
} from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import Breadcrumbs from '../Breadcrumbs'
import commonData from '../../data/commonData.json'

const SbuLevel = () => {
  const navigate = useNavigate()
  const { month, year } = useLocation().state || {}

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 1) Build your Intl.NumberFormat right here from commonData
  const {
    locale,
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  } = commonData.currencySettings

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  })

  // 2) Convert exponent strings like "e7" → 10^7, then format
  const formatValue = (val) => {
    if (typeof val === 'string') {
      const m = val.match(/^e(\d+)$/i)
      if (m) {
        val = Math.pow(10, Number(m[1]))
      } else if (!isNaN(val)) {
        val = Number(val)
      }
    }

    // Check if the value is a number and not NaN/Infinity before formatting as currency
    if (typeof val === 'number' && isFinite(val)) {
      return formatter.format(val)
    }
    return val // Return original value if not a number or not meant for currency formatting
  }

  // helper to get month name
  const getMonthName = (m) =>
    new Date(year, m - 1).toLocaleString('en-US', { month: 'long' })

  useEffect(() => {
    if (!month || !year) {
      setError('Month and year missing. Go back and select a period.')
      setLoading(false)
      return
    }

    const fetchSbu = async () => {
      setLoading(true)
      setError('')
      try {
        const payload = {
          month: Number(month),
          year: Number(year),
          monthNameParam: getMonthName(month).toLowerCase()
        }
        const resp = await axios.post(
          'http://localhost:8081/api/sbu',
          payload
        )
        setData(resp.data)
      } catch (err) {
        setError(err.response?.data || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSbu()
  }, [month, year])

  // Filter out specific revenue fields for display in the table,
  // assuming your backend response might include these as separate fields
  const columns = data.length
    ? Object.keys(data[0]).filter((col) => {
        const lc = col.toLowerCase()
        return (
          lc !== 'revenue' && // Example: if your backend returns a generic 'revenue' field
          lc !== 'sburevenue' && // Example: if your backend returns 'sbuRevenue'
          lc !== 'totalsburevenue' // Example: if your backend returns 'totalSbuRevenue'
        )
      })
    : []

  // Append a 'View' column to the headers
  const headerCols = [...columns, 'View']

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
        <Breadcrumbs path={[{ name: 'SBU Level', page: 'sbu' }]} />

        <Button variant="link" className="ps-0 mb-4" onClick={() => navigate(-1)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-left me-2">
              <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back
        </Button>

        <h2 className="text-center mb-4 fw-semibold text-dark">
          🏢 SBU Summary for{' '}
          <span className="text-primary">
            {getMonthName(month)} {year}
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
              onClick={() => navigate('/upload')} // Assuming /upload is the starting point for data selection
            >
              Go to Upload Page
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
                      <td key={col}>{formatValue(row[col])}</td>
                    ))}

                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() =>
                          navigate('/accounts', {
                            state: { 
                              month, 
                              year, 
                              // IMPORTANT: Use the actual SBU name/title field from your backend response
                              // For example, if your backend returns 'sbuName' for the SBU title:
                              sbu: row.sbuName // Assuming 'sbuName' is the field for SBU title
                              // If it's 'title', 'name', or something else, adjust accordingly.
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
  )
}

export default SbuLevel

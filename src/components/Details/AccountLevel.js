import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import Breadcrumbs from '../Breadcrumbs';
import commonData from '../../data/commonData.json';

// Utility to convert month number to month name
const getMonthName = (monthNumber) => {
  // Ensure monthNumber is valid
  if (monthNumber === null || monthNumber === undefined || isNaN(monthNumber)) return '';
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('en-US', { month: 'long' });
};

const AccountLevel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tableRef = useRef(null); // Ref to hold the table DOM element

  // UI state
  const [accounts, setAccounts] = useState([]); // Raw data fetched from API
  const [commentsMap, setCommentsMap] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active filters (derived from URL/sessionStorage)
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [activeMonthName, setActiveMonthName] = useState(null);
  const [activeSbu, setActiveSbu] = useState(null);

  // Column filters state (to store selected filter values for dropdowns)
  const [columnFilters, setColumnFilters] = useState({});

  const BACKEND_URL = 'http://localhost:8081'; // Backend API URL

  // Currency formatter settings from commonData
  const {
    locale,
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  } = commonData.currencySettings;

  // Function to format currency values
  const formatCurrency = (value = 0) =>
    value.toLocaleString(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    });

  // Effect to load Poppins font for consistent styling
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Poppins', sans-serif";
  }, []); // Run once on component mount

  // Effect to fetch accounts data based on active filters (month, year, sbu)
  useEffect(() => {
    const fetchAccountData = async (month, year, monthNameParam, sbu) => {
      setLoading(true);
      setError(null);

      try {
        const resp = await fetch(`${BACKEND_URL}/api/account`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ month, year, monthNameParam, sbu }),
        });
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(txt || resp.statusText);
        }
        const data = await resp.json();
        const list = Array.isArray(data) ? data : [data].filter(Boolean);
        setAccounts(list); // Update the raw accounts data

        // Initialize comments map from fetched data
        const initMap = {};
        list.forEach((acc) => {
          if (acc.accountComment) {
            initMap[acc.accountId] = acc.accountComment;
          }
        });
        setCommentsMap(initMap);
        setColumnFilters({}); // Reset column filters when new data is loaded
      } catch (e) {
        console.error('Error fetching account data:', e);
        setError(`Failed to load accounts: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Determine filter parameters from URL state, sessionStorage, or URL query params
    const qs = new URLSearchParams(location.search);
    let m = location.state?.month;
    let y = location.state?.year;
    let s = location.state?.sbu;

    // Fallback to sessionStorage or URL query if not present in location.state
    if (!m) {
      const sm = sessionStorage.getItem('lastFetchedAccountMonth');
      const qm = qs.get('month');
      m = sm ?? qm;
    }
    if (!y) {
      const sy = sessionStorage.getItem('lastFetchedAccountYear');
      const qy = qs.get('year');
      y = sy ?? qy;
    }
    if (!s) {
      const ss = sessionStorage.getItem('lastFetchedAccountSbu');
      const qsS = qs.get('sbu');
      s = ss ?? qsS;
    }

    // Normalize numeric values
    m = m ? parseInt(m, 10) : null;
    y = y ? parseInt(y, 10) : null;

    // Fetch data if necessary (if parameters changed or on initial load)
    if (m && y && s) {
      const mn = getMonthName(m);
      if (
        m !== activeMonth ||
        y !== activeYear ||
        s !== activeSbu ||
        accounts.length === 0 // Ensure data is fetched on initial load if empty
      ) {
        setActiveMonth(m);
        setActiveYear(y);
        setActiveMonthName(mn);
        setActiveSbu(s);

        // Store current filter values in sessionStorage
        sessionStorage.setItem('lastFetchedAccountMonth', m.toString());
        sessionStorage.setItem('lastFetchedAccountYear', y.toString());
        sessionStorage.setItem('lastFetchedAccountSbu', s);

        fetchAccountData(m, y, mn, s);
      }
    } else {
      setError('Missing month, year or SBU. Please navigate here with those parameters.');
      setLoading(false);
    }
  }, [location.state, location.search, activeMonth, activeYear, activeSbu, accounts.length]); // Dependencies for refetching data

  /**
   * Generates a unique list of options for a given column key from the raw accounts data.
   * @param {string} columnKey The key of the column to get unique values for.
   * @returns {string[]} An array of unique values, including an 'All' option, sorted.
   */
  const getUniqueOptions = (columnKey) => {
    const options = accounts.map(acc => acc[columnKey]);
    const unique = Array.from(new Set(options));
    // Sort numerically for numbers, lexicographically for strings
    unique.sort((a, b) => {
      const aNum = typeof a === 'number';
      const bNum = typeof b === 'number';
      if (aNum && bNum) return a - b;
      return String(a).localeCompare(String(b));
    });
    return ['All', ...unique];
  };

  /**
   * Handles changes to a column's filter dropdown.
   * Updates the `columnFilters` state with the new value.
   * @param {string} columnKey The key of the column being filtered.
   * @param {string} value The selected filter value.
   */
  const handleFilterChange = (columnKey, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value === 'All' ? null : value
    }));
  };

  /**
   * Helper function to apply filters to an array of rows.
   * This is used specifically for the Excel download to get the currently
   * filtered dataset, as DataTables handles the on-screen filtering.
   * @param {Array} rows The array of rows to filter.
   * @param {Object} filters The object containing column filters.
   * @returns {Array} The filtered array of rows.
   */
  const applyFilters = (rows, filters) => {
    const isNumericLike = (v) => {
      if (v === null || v === undefined) return false;
      if (typeof v === 'number') return true;
      if (typeof v === 'string') {
        const s = v.trim();
        if (s === '') return false;
        return !Number.isNaN(Number(s));
      }
      return false;
    };
    const nearlyEqual = (a, b, eps = 1e-6) => Math.abs(a - b) < eps; // For floating point comparison

    return rows.filter(row =>
      Object.keys(filters).every(key => {
        const filterValue = filters[key];
        if (filterValue === null || filterValue === undefined) return true; // No filter for this column

        const rowValue = row[key];
        if (rowValue === null || rowValue === undefined) return false; // Cannot match if row value is null/undefined

        if (isNumericLike(rowValue) && isNumericLike(filterValue)) {
          return nearlyEqual(Number(rowValue), Number(filterValue)); // Compare numbers
        }
        // Case-insensitive string comparison for other types
        return String(rowValue).trim().toLowerCase() === String(filterValue).trim().toLowerCase();
      })
    );
  };

  // Effect to initialize/destroy DataTables instance
  useEffect(() => {
    if (!loading && accounts.length > 0 && tableRef.current) {
      const $tbl = $(tableRef.current);
      // Destroy existing DataTable instance if it exists
      if ($.fn.DataTable.isDataTable($tbl)) {
        $tbl.DataTable().destroy();
      }
      // Initialize new DataTable instance
      const tableInstance = $tbl.DataTable({
        paging: true,
        searching: true, // Keep this true for the global search box
        ordering: false, // Disabling default ordering as per original code
        order: [], // Ensure no default order is applied
        info: true,
        autoWidth: false,
      });
      // Store the DataTables instance on the ref for later access
      tableRef.current.dataTableInstance = tableInstance;
    }

    // Cleanup function: destroy DataTable when component unmounts or accounts data changes
    return () => {
      if (tableRef.current && tableRef.current.dataTableInstance) {
        tableRef.current.dataTableInstance.destroy();
        tableRef.current.dataTableInstance = null; // Clear the instance
      }
    };
  }, [loading, accounts]); // Re-run when loading state or raw accounts data changes

  // New useEffect to apply filters using DataTables API
  useEffect(() => {
    if (tableRef.current && tableRef.current.dataTableInstance) {
      const tableInstance = tableRef.current.dataTableInstance;

      // Clear any existing column-specific searches before applying new ones
      tableInstance.columns().search('');

      // Define a mapping from column keys (used in state) to DataTables column indices
      const columnMapping = {
        accountId: 0,
        accountName: 1,
        totalProjects: 2,
        totalRevenue: 3,
        forecastNetRevenue: 4,
        difference: 5,
        // No index for Comment and View as they don't have direct filters in DataTables.
      };

      // Apply filters for each column based on the columnFilters state
      Object.keys(columnFilters).forEach(columnKey => {
        const filterValue = columnFilters[columnKey];
        if (filterValue !== null) { // Only apply filter if a value is selected
          const columnIndex = columnMapping[columnKey];
          if (columnIndex !== undefined) {
            // Use DataTables' column().search() method.
            // The `true, false` parameters enable regex and disable case-insensitivity.
            // Using `^value$` ensures an exact match for the cell content.
            tableInstance.column(columnIndex).search(`^${filterValue}$`, true, false);
          }
        }
      });

      // Redraw the table to apply all set filters
      tableInstance.draw();
    }
  }, [columnFilters]); // This effect runs whenever columnFilters state changes

  // Download Excel (.xls) of current table view (respects DataTables filters/search)
  const handleDownloadExcel = () => {
    const $tbl = $(tableRef.current);
    let headers = [
      'Account ID',
      'Account Name',
      'Total Projects',
      'Total Revenue',
      'Forecast Revenue',
      'Revenue Difference',
    ];
    let rows = [];

    if ($.fn.DataTable.isDataTable($tbl)) {
      const dt = $tbl.DataTable();

      // Read headers (first 6 columns) – strip select elements from text
      headers = $tbl
        .find('thead th')
        .slice(0, 6)
        .map(function () {
          const th = $(this).clone();
          th.find('select').remove(); // Remove the select dropdown for clean header text
          return th.text().trim();
        })
        .get();

      // Read visible rows (filtered by DataTables) and grab displayed text for first 6 cells
      const nodes = dt.rows({ search: 'applied' }).nodes().toArray();
      rows = nodes.map((tr) =>
        Array.from(tr.cells)
          .slice(0, 6) // Get data from the first 6 visible columns
          .map((td) => td.textContent.trim())
      );
    } else {
      // Fallback: build from the applyFilters helper if DataTables isn't initialized
      // This will use the current `columnFilters` state
      rows = applyFilters(accounts, columnFilters).map((acc) => [
        String(acc.accountId ?? ''),
        String(acc.accountName ?? ''),
        String(acc.totalProjects ?? ''),
        formatCurrency(acc.totalRevenue ?? 0),
        formatCurrency(acc.forecastNetRevenue ?? 0),
        formatCurrency(acc.difference ?? 0),
      ]);
    }

    // Build simple HTML table which Excel can open as .xls
    const theadHtml =
      '<tr>' + headers.map((h) => `<th>${h.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</th>`).join('') + '</tr>';
    const tbodyHtml = rows
      .map(
        (r) =>
          '<tr>' +
          r
            .map((v) => `<td>${String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</td>`)
            .join('') +
          '</tr>'
      )
      .join('');

    const html =
      `<html xmlns:o="urn:schemas-microsoft-com:office:office" ` +
      `xmlns:x="urn:schemas-microsoft-com:office:excel" ` +
      `xmlns="http://www.w3.org/TR/REC-html40">` +
      `<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>` +
      `<x:ExcelWorksheet><x:Name>AccountLevel</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>` +
      `</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>` +
      `<body><table border="1"><thead>${theadHtml}</thead><tbody>${tbodyHtml}</tbody></table></body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fileName = `AccountLevel_${activeSbu || 'All'}_${activeMonthName || ''}${activeYear || ''}.xls`;
    a.href = url;
    a.download = fileName.replace(/\s+/g, '_');
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Open comment modal handler
  const openCommentModal = (accId) => {
    setCurrentAccountId(accId);
    setCommentInput(commentsMap[accId] || '');
    setModalVisible(true);
  };

  // Save or update comment handler
  const saveComment = async () => {
    try {
      const dto = {
        accId: currentAccountId,
        month: activeMonth,
        year: activeYear,
        comment: commentInput,
      };
      const resp = await fetch(`${BACKEND_URL}/api/account/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!resp.ok) {
        throw new Error(await resp.text());
      }
      // Update local comments map and accounts state
      setCommentsMap((m) => ({ ...m, [currentAccountId]: commentInput }));
      setAccounts((list) =>
        list.map((acc) =>
          acc.accountId === currentAccountId
            ? { ...acc, accountComment: commentInput }
            : acc
        )
      );
      setModalVisible(false); // Close the modal on success
    } catch (e) {
      // Use a custom message box instead of alert() for better UX
      console.error('Error saving comment:', e);
      // You might want to implement a custom toast/modal for errors here.
      alert('Error saving comment: ' + e.message); // Temporarily keeping alert as per original for debugging context
    }
  };

  // Dynamic breadcrumb path for navigation
  const breadcrumbPath = [
    { name: 'PMO Dashboard', page: '' },
    { name: 'Revenue Forecast - Early View', page: 'upload' },
    ...(activeSbu ? [{ name: `${activeSbu} SBU Level`, page: 'sbu' }] : []),
    { name: 'Account Level', page: 'accounts' },
  ].filter(Boolean); // Filter out any null/undefined entries

  // Render loading state
  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="ms-3 text-primary">Loading Account Data...</p>
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
          onClick={() => navigate('/upload')} // Navigate back to upload page on error
        >
          Go to Upload Page
        </button>
      </div>
    );
  }

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
        {/* Breadcrumbs component for navigation hierarchy */}
        <Breadcrumbs path={breadcrumbPath} />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
          <h2 className="mb-3 mb-md-0 fw-semibold text-dark">
            🏢 Account Level Overview – {activeSbu}
            {activeMonthName && activeYear && (
              <span className="ms-2 text-primary">
                ({activeMonthName} {activeYear})
              </span>
            )}
          </h2>
          {/* Download Excel button */}
          <button
            type="button"
            onClick={handleDownloadExcel}
            disabled={loading || !!error}
            title="Download current table view as Excel"
            className="btn"
            style={{ backgroundColor: '#ffffff', border: '1px solid #198754', color: '#198754' }}
          >
            Download
          </button>
        </div>

        <div className="table-responsive rounded">
          <table
            ref={tableRef}
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
                {/* Table headers with integrated filter dropdowns */}
                <th>
                  Account ID
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) => handleFilterChange('accountId', e.target.value)}
                    value={columnFilters.accountId || 'All'}
                  >
                    {getUniqueOptions('accountId').map(opt => (
                      <option key={String(opt)} value={opt}>{opt}</option>
                    ))}
                  </select>
                </th>
                <th>
                  Account Name
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) => handleFilterChange('accountName', e.target.value)}
                    value={columnFilters.accountName || 'All'}
                  >
                    {getUniqueOptions('accountName').map(opt => (
                      <option key={String(opt)} value={opt}>{opt}</option>
                    ))}
                  </select>
                </th>
                <th>
                  Total Projects
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) => handleFilterChange('totalProjects', e.target.value)}
                    value={columnFilters.totalProjects || 'All'}
                  >
                    {getUniqueOptions('totalProjects').map(opt => (
                      <option key={String(opt)} value={opt}>{opt}</option>
                    ))}
                  </select>
                </th>
                <th>
                  Total Revenue
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) => handleFilterChange('totalRevenue', e.target.value)}
                    value={columnFilters.totalRevenue || 'All'}
                  >
                    {getUniqueOptions('totalRevenue').map(opt => (
                      <option key={String(opt)} value={opt}>{opt}</option>
                    ))}
                  </select>
                </th>
                <th>
                  Forecast Revenue
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) => handleFilterChange('forecastNetRevenue', e.target.value)}
                    value={columnFilters.forecastNetRevenue || 'All'}
                  >
                    {getUniqueOptions('forecastNetRevenue').map(opt => (
                      <option key={String(opt)} value={opt}>{opt}</option>
                    ))}
                  </select>
                </th>
                <th>
                  Revenue Difference
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) => handleFilterChange('difference', e.target.value)}
                    value={columnFilters.difference || 'All'}
                  >
                    {getUniqueOptions('difference').map(opt => (
                      <option key={String(opt)} value={opt}>{opt}</option>
                    ))}
                  </select>
                </th>
                <th className="text-center">Comment</th>
                <th className="text-center">View</th>
              </tr>
            </thead>
            <tbody>
              {/* Render rows directly from the 'accounts' state. DataTables will handle filtering visibility. */}
              {accounts.map((acc) => (
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
                      title={commentsMap[acc.accountId] || "Add/View Comment"}
                    >
                      💬
                    </button>
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary rounded-circle"
                      onClick={() =>
                        navigate(`/accounts/${acc.accountId}/project-types`, {
                          state: {
                            accId: acc.accountId,
                            month: activeMonth,
                            year: activeYear,
                            monthName: activeMonthName,
                            sbu: activeSbu,
                          },
                        })
                      }
                      title="View Project Types"
                    >
                      🔍
                    </button>
                  </td>
                </tr>
              ))}
              {/* Display "No results" only if the original accounts array is empty and not loading */}
              {!loading && accounts.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">No account data available for this selection.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for adding/editing comments */}
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
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Enter your comment here..."
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

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import Breadcrumbs from '../Breadcrumbs';
import commonData from '../../data/commonData.json';

// Utility to convert month number to month name
const getMonthName = (monthNumber) => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('en-US', { month: 'long' });
};

const AccountLevel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tableRef = useRef(null);

  // UI state
  const [accounts, setAccounts] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active filters
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [activeMonthName, setActiveMonthName] = useState(null);
  const [activeSbu, setActiveSbu] = useState(null);

  const BACKEND_URL = 'http://localhost:8081';

  // Currency formatter
  const {
    locale,
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  } = commonData.currencySettings;

  const formatCurrency = (value = 0) =>
    value.toLocaleString(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    });

  // Load Poppins font
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Poppins', sans-serif";
  }, []);

  // Fetch accounts when filters change
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
        setAccounts(list);

        // seed comments map
        const initMap = {};
        list.forEach((acc) => {
          if (acc.accountComment) {
            initMap[acc.accountId] = acc.accountComment;
          }
        });
        setCommentsMap(initMap);
      } catch (e) {
        console.error(e);
        setError(`Failed to load accounts: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Read from React state, sessionStorage, or URL query
    const qs = new URLSearchParams(location.search);
    let m = location.state?.month;
    let y = location.state?.year;
    let s = location.state?.sbu;

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

    if (m && y && s) {
      const mn = getMonthName(m);
      // only refetch if any filter changed or first load
      if (
        m !== activeMonth ||
        y !== activeYear ||
        s !== activeSbu ||
        accounts.length === 0
      ) {
        setActiveMonth(m);
        setActiveYear(y);
        setActiveMonthName(mn);
        setActiveSbu(s);

        sessionStorage.setItem('lastFetchedAccountMonth', m.toString());
        sessionStorage.setItem('lastFetchedAccountYear', y.toString());
        sessionStorage.setItem('lastFetchedAccountSbu', s);

        fetchAccountData(m, y, mn, s);
      }
    } else {
      setError(
        'Missing month, year or SBU. Please navigate here with those parameters.'
      );
      setLoading(false);
    }
  }, [location.state, location.search, activeMonth, activeYear, activeSbu, accounts.length]);

  // Initialize & destroy DataTable
  useEffect(() => {
    if (!loading && accounts.length > 0 && tableRef.current) {
      const $tbl = $(tableRef.current);
      if ($.fn.DataTable.isDataTable($tbl)) {
        $tbl.DataTable().destroy();
      }
      $tbl.DataTable({
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: false,
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
  }, [loading, accounts]);

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

      // Read headers (first 6 columns)
      headers = $tbl
        .find('thead th')
        .slice(0, 6)
        .map(function () {
          return $(this).text().trim();
        })
        .get();

      // Read visible rows (filtered) and grab displayed text for first 6 cells
      const nodes = dt.rows({ search: 'applied' }).nodes().toArray();
      rows = nodes.map((tr) =>
        Array.from(tr.cells)
          .slice(0, 6)
          .map((td) => td.textContent.trim())
      );
    } else {
      // Fallback: build from state
      rows = accounts.map((acc) => [
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

  // Open comment modal
  const openCommentModal = (accId) => {
    setCurrentAccountId(accId);
    setCommentInput(commentsMap[accId] || '');
    setModalVisible(true);
  };

  // Save or update comment
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
      // update local maps
      setCommentsMap((m) => ({ ...m, [currentAccountId]: commentInput }));
      setAccounts((list) =>
        list.map((acc) =>
          acc.accountId === currentAccountId
            ? { ...acc, accountComment: commentInput }
            : acc
        )
      );
      setModalVisible(false);
    } catch (e) {
      alert('Error saving comment: ' + e.message);
    }
  };

  // Dynamic breadcrumb path
  const breadcrumbPath = [
    { name: 'PMO Dashboard', page: '' },
    { name: 'Revenue Forecast - Early View', page: 'upload' },
    ...(activeSbu ? [{ name: `${activeSbu} SBU Level`, page: 'sbu' }] : []),
    { name: 'Account Level', page: 'accounts' },
  ].filter(Boolean);

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

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
          <h2 className="mb-3 mb-md-0 fw-semibold text-dark">
            🏢 Account Level Overview – {activeSbu}
            {activeMonthName && activeYear && (
              <span className="ms-2 text-primary">
                ({activeMonthName} {activeYear})
              </span>
            )}
          </h2>
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

        {loading ? (
          <div className="d-flex justify-content-center align-items-center">
            <div className="spinner-border text-primary" role="status" />
            <p className="ms-3 text-primary">Loading Account Data...</p>
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
        ) : (
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
                  <th>Account ID</th>
                  <th>Account Name</th>
                  <th>Total Projects</th>
                  <th>Total Revenue</th>
                  <th>Forecast Revenue</th>
                  <th>Revenue Difference</th>
                  <th className="text-center">Comment</th>
                  <th className="text-center">View</th>
                </tr>
              </thead>
              <tbody>
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
              </tbody>
            </table>
          </div>
        )}
      </div>

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
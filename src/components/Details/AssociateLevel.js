import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import { Bell, Download, Search, Filter } from 'lucide-react';
import Breadcrumbs from '../Breadcrumbs';
import commonData from '../../data/commonData.json';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AssociateLevel = () => {
  const navigate = useNavigate();
  const { projectId: urlProjectId } = useParams();
  const location = useLocation();
  const tableRef = useRef(null);
  const dataTableInstance = useRef(null);

  const [associates, setAssociates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeProjectName, setActiveProjectName] = useState('Loading...');
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [activeAccountName, setActiveAccountName] = useState('Loading...');
  const [filterOption, setFilterOption] = useState('showAll');

  const BACKEND_URL = 'http://localhost:8081';

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

  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Poppins', sans-serif";
  }, []);

  useEffect(() => {
    const fetchAssociateData = async (month, year, projId) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(`${BACKEND_URL}/api/associate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ month, year, projectId: projId }),
        });
        if (!resp.ok) {
          const msg = await resp.text();
          throw new Error(
            `status: ${resp.status}, message: ${msg || resp.statusText}`
          );
        }
        const data = await resp.json();
        const list = Array.isArray(data) ? data : [data].filter(Boolean);
        setAssociates(list);

        if (list.length > 0) {
          const first = list[0];
          setActiveProjectName(first.projectName || projId);
          setActiveAccountId(first.accountId || activeAccountId);
          setActiveAccountName(first.accountName || activeAccountName);
        }
      } catch (e) {
        console.error('Error fetching associate data:', e);
        setError(`Failed to load associate data: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    let month = location.state?.month;
    let year = location.state?.year;
    let projId = urlProjectId;
    let acctId = location.state?.accountId;
    let acctName = location.state?.accountName;
    let projName = location.state?.projectName;

    if (!month || !year || !acctId || !projName) {
      const sm = sessionStorage.getItem('lastFetchedAssociateMonth');
      const sy = sessionStorage.getItem('lastFetchedAssociateYear');
      const sp = sessionStorage.getItem('lastFetchedAssociateProjectId');
      const sn = sessionStorage.getItem('lastFetchedAssociateProjectName');
      const sa = sessionStorage.getItem('lastFetchedAssociateAccountId');
      const san = sessionStorage.getItem('lastFetchedAssociateAccountName');
      if (sm && sy && sp) {
        month = parseInt(sm, 10);
        year = parseInt(sy, 10);
        projId = sp;
        projName = sn;
        acctId = sa;
        acctName = san;
      }
    }

    if (month && year && projId && acctId && projName) {
      if (
        month !== activeMonth ||
        year !== activeYear ||
        projId !== activeProjectId ||
        associates.length === 0
      ) {
        setActiveMonth(month);
        setActiveYear(year);
        setActiveProjectId(projId);
        setActiveProjectName(projName);
        setActiveAccountId(acctId);
        setActiveAccountName(acctName);

        sessionStorage.setItem('lastFetchedAssociateMonth', month.toString());
        sessionStorage.setItem('lastFetchedAssociateYear', year.toString());
        sessionStorage.setItem('lastFetchedAssociateProjectId', projId);
        sessionStorage.setItem('lastFetchedAssociateProjectName', projName);
        sessionStorage.setItem('lastFetchedAssociateAccountId', acctId);
        sessionStorage.setItem('lastFetchedAssociateAccountName', acctName);

        fetchAssociateData(month, year, projId);
      } else {
        setLoading(false);
      }
    } else {
      setError(
        'Missing associate context (month, year, project, or account). Please go back.'
      );
      setLoading(false);
    }
  }, [
    location.state,
    urlProjectId,
    activeMonth,
    activeYear,
    activeProjectId,
    associates.length,
  ]);

  useEffect(() => {
    if (!loading && tableRef.current) {
      const $tbl = $(tableRef.current);
      if ($.fn.DataTable.isDataTable($tbl)) {
        dataTableInstance.current.destroy();
      }

      $.fn.dataTable.ext.search.pop();

      if (filterOption === 'varianceAboveZero') {
        $.fn.dataTable.ext.search.push((settings, data, dataIndex) => {
          const varianceHoursMonthly = parseFloat(data[7]) || 0;
          return varianceHoursMonthly !== 0;
        });
      }

      dataTableInstance.current = $tbl.DataTable({
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: false,
        dom: '<"d-flex flex-column flex-md-row justify-content-between align-items-center mb-3"<"mb-2 mb-md-0"l><"ms-md-auto"f>>t<"d-flex flex-column flex-md-row justify-content-between align-items-center mt-3"<"mb-2 mb-md-0"i>p>',
        language: {
          search: 'Search:',
          lengthMenu: 'Show _MENU_ entries',
        },
      });
    }

    return () => {
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
        dataTableInstance.current = null;
      }
      $.fn.dataTable.ext.search.pop();
    };
  }, [loading, associates, filterOption]);

  const breadcrumbPath = [
    { name: 'PMO Dashboard', page: '' },
    { name: 'Revenue Forecast - Early View', page: 'upload' },
    { name: 'Account Level', page: 'accounts' },
    {
      name: `Projects (${activeAccountName})`,
      page: `accounts/${activeAccountId}/projects`,
    },
    {
      name: `Associates (${activeProjectName})`,
      page: `projects/${activeProjectId}/associates`,
    },
  ];

  const handleNotifyAll = () => {
    console.log('Notifying all associates for this project!');
  };

  const handleDownloadData = () => {
    // 1. Get ALL filtered data from DataTables (across all pages)
    const filteredData = dataTableInstance.current
      .rows({ search: 'applied' }) // Removed 'page: "current"'
      .data()
      .toArray();

    // 2. Define the headers for the Excel file
    const headers = [
      'Associate ID',
      'Associate Name',
      'Project ID',
      'Project Name',
      'PM ID',
      'Total Company Hours (Monthly)',
      'Total Client Hours (Monthly)',
      'Variance Hours (Monthly)',
      'Actual Revenue',
      'Associate Rate',
    ];

    // 3. Prepare the data in a format suitable for XLSX
    const dataForExcel = filteredData.map((row) => ({
      'Associate ID': row[0],
      'Associate Name': row[1],
      'Project ID': row[2],
      'Project Name': row[3],
      'PM ID': row[4],
      'Total Company Hours (Monthly)': row[5],
      'Total Client Hours (Monthly)': row[6],
      'Variance Hours (Monthly)': row[7],
      'Actual Revenue': row[8],
      'Associate Rate': row[9],
    }));

    // 4. Create a new workbook and a worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataForExcel, { header: headers });

    // 5. Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Associate Data');

    // 6. Generate the Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    // 7. Save the file using file-saver
    const filename = `Associate_Data_${activeProjectName}_${activeMonth}-${activeYear}.xlsx`;
    saveAs(dataBlob, filename);

    console.log('Downloading all filtered associate data for this project in Excel format!');
  };

  const handleFilterChange = (event) => {
    setFilterOption(event.target.value);
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="spinner-border text-primary" role="status" />
        <p className="ms-3 text-primary font-medium">Loading Associate Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-danger bg-gradient-to-br from-red-50 to-pink-100">
        <p className="fs-4 text-red-600 font-semibold">Error: {error}</p>
        <button
          className="btn btn-primary mt-3 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
          onClick={() => navigate(`/accounts/${activeAccountId}/projects`)}
        >
          Go to Project Level
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center px-3 py-4 bg-gradient-to-br from-slate-50 to-blue-50"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div
        className="card shadow-lg p-4 w-100"
        style={{
          maxWidth: '1100px',
          backgroundColor: '#ffffffee',
          borderRadius: '1rem',
        }}
      >
        <Breadcrumbs path={breadcrumbPath} />

        <div className="d-flex flex-column gap-3 mb-4">
          <div className="w-100 text-center text-md-start">
            <h2 className="mb-0 fw-semibold text-dark">
              {' '}
              👤 Associate Details – Project: {activeProjectName}
            </h2>
          </div>

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 w-100">
            <div className="d-flex align-items-center">
              <label
                htmlFor="varianceFilter"
                className="form-label mb-0 me-2 fw-semibold text-slate-700 text-nowrap"
              >
                <Filter className="inline-block me-1 text-blue-500" size={18} />{' '}
                Filter
              </label>
              <select
                id="varianceFilter"
                className="form-select rounded-lg px-3 py-2 shadow-sm border border-slate-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all"
                value={filterOption}
                onChange={handleFilterChange}
                style={{ minWidth: '180px' }}
              >
                <option value="showAll">Show All Variance</option>
                <option value="varianceAboveZero">Variance not 0</option>
              </select>
            </div>

            <div className="d-flex gap-2 ms-auto">
              <button
                className="btn btn-outline-info rounded-lg px-4 py-2 d-flex align-items-center shadow-sm hover:shadow-md hover:scale-105 transition-all text-blue-700 border-blue-300 hover:bg-blue-50"
                onClick={handleNotifyAll}
              >
                <Bell className="me-2" size={18} /> Notify All
              </button>
              <button
                className="btn btn-outline-success rounded-lg px-4 py-2 d-flex align-items-center shadow-sm hover:shadow-md hover:scale-105 transition-all text-green-700 border-green-300 hover:bg-green-50"
                onClick={handleDownloadData}
              >
                <Download className="me-2" size={18} /> Download Data
              </button>
            </div>
          </div>
        </div>

        <div className="table-responsive rounded shadow-sm">
          <table
            ref={tableRef}
            className="display table table-hover table-borderless align-middle mb-0 w-100"
            style={{ width: '100%' }}
          >
            <thead
              style={{
                background: 'linear-gradient(to right, #0ea5e9, #2563eb)',
                color: 'white',
              }}
            >
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Associate ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Associate Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Project ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Project Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">PM ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Total Company Hours (Monthly)
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Total Client Hours (Monthly)
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Variance Hours (Monthly)
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Actual Revenue
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Associate Rate
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Notify</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">
                  View Daily
                </th>
              </tr>
            </thead>
            <tbody>
              {associates.map((associate) => (
                <tr
                  key={associate.associateId}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-slate-800">
                    {associate.associateId}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800 font-medium">
                    {associate.associateName}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {associate.projectId}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {associate.projectName}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {associate.esaID}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 font-mono">
                    {associate.totalCompanyHoursMonthly}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 font-mono">
                    {associate.totalClientHoursMonthly}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">
                    <span
                      className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        (associate.varianceHoursMonthly || 0) > 0
                          ? 'bg-red-100 text-red-800'
                          : (associate.varianceHoursMonthly || 0) < 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-700'
                      }
                    `}
                    >
                      {associate.varianceHoursMonthly}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800 font-semibold">
                    {formatCurrency(associate.actualRevenue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {formatCurrency(associate.associateRtRate)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="btn btn-sm btn-outline-info rounded-lg px-3 py-1 d-flex align-items-center text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors">
                      <Bell size={16} className="me-1" /> Notify
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      className="btn btn-sm btn-outline-primary rounded-full p-2 d-flex align-items-center justify-content-center text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors"
                      onClick={() => {
                        navigate(
                          `/projects/${associate.projectId}/associates/${associate.associateId}/daily`,
                          {
                            state: {
                              month: activeMonth,
                              year: activeYear,
                              projectId: associate.projectId,
                              projectName: associate.projectName,
                              accountId: activeAccountId,
                              accountName: activeAccountName,
                              associateId: associate.associateId,
                              associateName: associate.associateName,
                            },
                          }
                        );
                      }}
                    >
                      <Search size={16} />
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

export default AssociateLevel;
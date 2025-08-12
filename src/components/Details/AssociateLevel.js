import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import { Bell, Download, Search } from 'lucide-react';
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

  // Active context states, initialized to null or 'Loading...' for immediate feedback
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeProjectName, setActiveProjectName] = useState('Loading...');
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [activeAccountName, setActiveAccountName] = useState('Loading...');
  const [activeSbu, setActiveSbu] = useState(null);
  const [activeProjectType, setActiveProjectType] = useState(null);
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

  // Load Poppins font
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Poppins', sans-serif";
  }, []);

  // Effect to determine context from various sources and trigger data fetch
  useEffect(() => {
    // These variables hold the "best guess" for context BEFORE the API call
    // They are used for initial state setting and fallbacks.
    let monthToUse = location.state?.month || sessionStorage.getItem('lastFetchedAssociateMonth');
    let yearToUse = location.state?.year || sessionStorage.getItem('lastFetchedAssociateYear');
    let projIdToUse = urlProjectId || sessionStorage.getItem('lastFetchedAssociateProjectId');
    let projNameToUse = location.state?.projectName || sessionStorage.getItem('lastFetchedAssociateProjectName');
    let acctIdToUse = location.state?.accountId || sessionStorage.getItem('lastFetchedAssociateAccountId');
    let acctNameToUse = location.state?.accountName || sessionStorage.getItem('lastFetchedAssociateAccountName');
    let sbuToUse = location.state?.sbu || sessionStorage.getItem('lastFetchedAssociateSbu');
    let projectTypeToUse = location.state?.projectType || sessionStorage.getItem('lastFetchedAssociateProjectType');

    // Convert to number
    monthToUse = monthToUse ? parseInt(monthToUse, 10) : null;
    yearToUse = yearToUse ? parseInt(yearToUse, 10) : null;

    // Update active states immediately. This makes sure breadcrumbs have values
    // as soon as possible, even before the data fetch completes.
    setActiveMonth(monthToUse);
    setActiveYear(yearToUse);
    setActiveProjectId(projIdToUse);
    // Use the derived names for initial state, falling back to 'Loading...'
    setActiveProjectName(projNameToUse || 'Loading...');
    setActiveAccountId(acctIdToUse);
    setActiveAccountName(acctNameToUse || 'Loading...');
    setActiveSbu(sbuToUse);
    setActiveProjectType(projectTypeToUse);

    // Persist context to sessionStorage for future loads
    if (monthToUse) sessionStorage.setItem('lastFetchedAssociateMonth', monthToUse.toString());
    if (yearToUse) sessionStorage.setItem('lastFetchedAssociateYear', yearToUse.toString());
    if (projIdToUse) sessionStorage.setItem('lastFetchedAssociateProjectId', projIdToUse);
    if (projNameToUse) sessionStorage.setItem('lastFetchedAssociateProjectName', projNameToUse);
    if (acctIdToUse) sessionStorage.setItem('lastFetchedAssociateAccountId', acctIdToUse);
    if (acctNameToUse) sessionStorage.setItem('lastFetchedAssociateAccountName', acctNameToUse);
    if (sbuToUse) sessionStorage.setItem('lastFetchedAssociateSbu', sbuToUse);
    if (projectTypeToUse) sessionStorage.setItem('lastFetchedAssociateProjectType', projectTypeToUse);

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

        // Update ProjectName and AccountName from fetched data if valid
        // Prioritize the fetched accountName, but if it's null/undefined,
        // use the acctNameToUse from context (passed via navigation/session)
        // as a secondary fallback before 'Unknown Account'
        if (list.length > 0) {
          setActiveProjectName(list[0].projectName || projId);
          setActiveAccountName(list[0].accountName || acctNameToUse || 'Unknown Account');
        } else {
          // If no data, ensure names are still set to the best available context or 'N/A'
          setActiveProjectName(projNameToUse || 'N/A');
          setActiveAccountName(acctNameToUse || 'N/A');
        }
      } catch (e) {
        console.error('Error fetching associate data:', e);
        setError(`Failed to load associate data: ${e.message}`);
        setActiveProjectName('Error'); // Set to 'Error' on fetch failure
        setActiveAccountName('Error'); // Set to 'Error' on fetch failure
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if all necessary core context is available
    // and if the key context parameters have changed since last render
    const contextChanged =
      monthToUse !== activeMonth ||
      yearToUse !== activeYear ||
      projIdToUse !== activeProjectId ||
      sbuToUse !== activeSbu ||
      projectTypeToUse !== activeProjectType;

    if (monthToUse && yearToUse && projIdToUse && acctIdToUse && projNameToUse) {
      if (contextChanged || associates.length === 0) { // Re-fetch if context changed or data is empty
        fetchAssociateData(monthToUse, yearToUse, projIdToUse);
      } else {
        setLoading(false); // Context hasn't changed, data already loaded
      }
    } else {
      setError('Missing associate context (month, year, project, or account). Please go back.');
      setLoading(false);
    }
  }, [
    location.state,
    urlProjectId,
    // Include all 'active' context states that drive the fetch logic in dependencies
    activeMonth,
    activeYear,
    activeProjectId,
    activeSbu,
    activeProjectType,
    associates.length, // Keep this if you want to re-fetch if data array becomes empty
  ]);

  // DataTable initialization and destruction
  useEffect(() => {
    if (!loading && tableRef.current) {
      const $tbl = $(tableRef.current);
      if ($.fn.DataTable.isDataTable($tbl)) {
        dataTableInstance.current.destroy();
      }

      $.fn.dataTable.ext.search.pop();

      if (filterOption === 'varianceAboveZero') {
        $.fn.dataTable.ext.search.push((settings, data, dataIndex) => {
          const associate = associates[dataIndex];
          const varianceHoursMonthly = parseFloat(associate.varianceHoursMonthly) || 0;
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
        columns: [
          { data: 'associateId' },
          { data: 'associateName' },
          { data: 'projectId' },
          { data: 'projectName' },
          { data: 'esaID' },
          { data: 'totalCompanyHoursMonthly' },
          { data: 'totalClientHoursMonthly' },
          {
            data: 'varianceHoursMonthly',
            render: function (data, type, row) {
              if (type === 'display' || type === 'filter') {
                const variance = parseFloat(data) || 0;
                let className = 'bg-slate-100 text-slate-700';
                if (variance > 0) {
                  className = 'bg-red-100 text-red-800';
                } else if (variance < 0) {
                  className = 'bg-green-100 text-green-800';
                }
                return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}">${data}</span>`;
              }
              return data;
            }
          },
          {
            data: 'actualRevenue',
            render: function (data, type, row) {
              return type === 'display' ? formatCurrency(data) : data;
            }
          },
          {
            data: 'associateRtRate',
            render: function (data, type, row) {
              return type === 'display' ? formatCurrency(data) : data;
            }
          },
          {
            data: null,
            className: 'text-center',
            orderable: false,
            render: function (data, type, row) {
              return `
                <button class="btn btn-sm btn-outline-info rounded-lg px-3 py-1 d-flex align-items-center text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors notify-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell me-1"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg> Notify
                </button>
              `;
            }
          },
          {
            data: null,
            className: 'text-center',
            orderable: false,
            render: function (data, type, row) {
              return `
                <button class="btn btn-sm btn-outline-primary rounded-full p-2 d-flex align-items-center justify-content-center text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors view-daily-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </button>
              `;
            }
          }
        ],
        data: associates
      });

      $tbl.on('click', '.notify-btn', function() {
        const rowData = dataTableInstance.current.row($(this).parents('tr')).data();
        console.log('Notify clicked for:', rowData.associateName);
        handleNotifyAssociate(rowData.associateId);
      });

      $tbl.on('click', '.view-daily-btn', function() {
        const rowData = dataTableInstance.current.row($(this).parents('tr')).data();
        navigate(
          `/projects/${rowData.projectId}/associates/${rowData.associateId}/daily`,
          {
            state: {
              month: activeMonth,
              year: activeYear,
              projectId: rowData.projectId,
              projectName: rowData.projectName,
              accountId: activeAccountId,
              accountName: activeAccountName,
              associateId: rowData.associateId,
              associateName: rowData.associateName,
              sbu: activeSbu,
              projectType: activeProjectType
            },
          }
        );
      });

    }

    return () => {
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
        dataTableInstance.current = null;
      }
      $.fn.dataTable.ext.search.pop();
      $(tableRef.current).off('click', '.notify-btn');
      $(tableRef.current).off('click', '.view-daily-btn');
    };
  }, [loading, associates, filterOption, navigate, activeMonth, activeYear, activeAccountId, activeAccountName, activeSbu, activeProjectType]);

  // Define breadcrumb path for navigation
  const breadcrumbPath = [
    { name: 'PMO Dashboard', page: '' },
    { name: 'Revenue Forecast - Early View', page: 'upload' },
    ...(activeSbu ? [{ name: `${activeSbu} SBU Level`, page: 'sbu', state: { month: activeMonth, year: activeYear, sbu: activeSbu } }] : []),
    { name: 'Account Level', page: `accounts`, state: { month: activeMonth, year: activeYear, sbu: activeSbu } },
    ...(activeProjectType ? [{ name: `${activeProjectType} Project Type`, page: `accounts/${activeAccountId}/project-types`, state: { month: activeMonth, year: activeYear, sbu: activeSbu, accId: activeAccountId } }] : []),
    {
      // Updated to 'Project Level' and now correctly uses activeAccountName
      name: `Project Level (${activeAccountName || 'Loading...'})`, // Use the state variable, provide a fallback
      page: `accounts/${activeAccountId}/projects`,
      state: {
        month: activeMonth,
        year: activeYear,
        sbu: activeSbu,
        accId: activeAccountId,
        accountName: activeAccountName, // Pass activeAccountName
        projectType: activeProjectType
      }
    },
    {
      name: `Associates (${activeProjectName})`,
      page: `projects/${activeProjectId}/associates`,
    },
  ].filter(Boolean);

  const handleNotifyAll = () => {
    console.log('Notifying all associates for this project!');
  };

  const handleNotifyAssociate = (associateId) => {
    console.log(`Notifying associate with ID: ${associateId}`);
  };

  const handleDownloadData = () => {
    let dataToExport = associates;
    if (filterOption === 'varianceAboveZero') {
        dataToExport = associates.filter(associate => (parseFloat(associate.varianceHoursMonthly) || 0) !== 0);
    }

    if (dataToExport.length === 0) {
      console.log('No data to download after applying filters.');
      return;
    }

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

    const dataForExcel = dataToExport.map((associate) => ({
      'Associate ID': associate.associateId,
      'Associate Name': associate.associateName,
      'Project ID': associate.projectId,
      'Project Name': associate.projectName,
      'PM ID': associate.esaID,
      'Total Company Hours (Monthly)': associate.totalCompanyHoursMonthly,
      'Total Client Hours (Monthly)': associate.totalClientHoursMonthly,
      'Variance Hours (Monthly)': associate.varianceHoursMonthly,
      'Actual Revenue': formatCurrency(associate.actualRevenue),
      'Associate Rate': formatCurrency(associate.associateRtRate),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataForExcel, { header: headers });

    XLSX.utils.book_append_sheet(wb, ws, 'Associate Data');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

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
          onClick={() => navigate(`/accounts/${activeAccountId}/projects`, {
            state: {
              month: activeMonth,
              year: activeYear,
              accId: activeAccountId,
              accountName: activeAccountName,
              sbu: activeSbu,
              projectType: activeProjectType
            }
          })}
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
                Sort
              </label>
              <select
                id="varianceFilter"
                className="form-select rounded-lg px-3 py-2 shadow-sm border border-slate-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all"
                value={filterOption}
                onChange={handleFilterChange}
                style={{ minWidth: '220px' }}
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
                              sbu: activeSbu,
                              projectType: activeProjectType
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

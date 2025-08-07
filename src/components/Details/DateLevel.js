import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import Breadcrumbs from '../Breadcrumbs';
import commonData from '../../data/commonData.json';

const DateLevel = () => {
  const navigate = useNavigate();
  const { projectId: urlProjectId, associateId: urlAssociateId } = useParams();
  const location = useLocation();

  const tableRef = useRef(null);
  const dataTableInstance = useRef(null);
  const hasFetchedRef = useRef(false); // Prevent multiple API calls

  const [dailyHours, setDailyHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeMonth, setActiveMonth] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeProjectName, setActiveProjectName] = useState('Loading...');
  const [activeAssociateId, setActiveAssociateId] = useState(null);
  const [activeAssociateName, setActiveAssociateName] = useState('Loading...');
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [activeAccountName, setActiveAccountName] = useState('Loading...');
  const [activeSbu, setActiveSbu] = useState(null);
  const [activeProjectType, setActiveProjectType] = useState(null);

  const BACKEND_URL = 'http://localhost:8081';

  // Currency formatter
  const {
    locale,
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  } = commonData.currencySettings;
  const formatCurrency = (val = 0) =>
    val.toLocaleString(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    });

  // Load Poppins font once
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Poppins', sans-serif";
  }, []);

  // Fetch daily hours data (guarded by hasFetchedRef)
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchDailyHoursData = async (month, year, projId, assocId) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BACKEND_URL}/api/date-level`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ month, year, projectId: projId, associateId: assocId })
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`status: ${response.status}, message: ${errText || response.statusText}`);
        }
        const data = await response.json();
        const list = Array.isArray(data) ? data : [data].filter(Boolean);
        setDailyHours(list);

        if (list.length > 0) {
          setActiveProjectName(list[0].projectName || projId);
          setActiveAssociateName(list[0].associateName || assocId);
          setActiveAccountName(list[0].accountName || activeAccountName);
          setActiveAccountId(list[0].accountId || activeAccountId);
        }
      } catch (err) {
        console.error('Error fetching daily hours data:', err);
        setError(`Failed to load daily hours data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Derive context from location.state, URL params, or sessionStorage
    let monthToUse = location.state?.month;
    let yearToUse = location.state?.year;
    let projectIdToUse = urlProjectId;
    let associateIdToUse = urlAssociateId;
    let projectNameToUse = location.state?.projectName;
    let associateNameToUse = location.state?.associateName;
    let accountIdToUse = location.state?.accountId;
    let accountNameToUse = location.state?.accountName;
    let sbuToUse = location.state?.sbu;
    let projectTypeToUse = location.state?.projectType;

    if (!monthToUse)   monthToUse   = sessionStorage.getItem('lastFetchedDateMonth');
    if (!yearToUse)    yearToUse    = sessionStorage.getItem('lastFetchedDateYear');
    if (!projectNameToUse) projectNameToUse = sessionStorage.getItem('lastFetchedDateProjectName');
    if (!associateNameToUse) associateNameToUse = sessionStorage.getItem('lastFetchedDateAssociateName');
    if (!accountIdToUse) accountIdToUse = sessionStorage.getItem('lastFetchedDateAccountId');
    if (!accountNameToUse) accountNameToUse = sessionStorage.getItem('lastFetchedDateAccountName');
    if (!sbuToUse)     sbuToUse     = sessionStorage.getItem('lastFetchedDateSbu');
    if (!projectTypeToUse) projectTypeToUse = sessionStorage.getItem('lastFetchedDateProjectType');

    monthToUse = monthToUse ? parseInt(monthToUse, 10) : null;
    yearToUse  = yearToUse  ? parseInt(yearToUse, 10) : null;

    // Only fetch if context is valid
    if (
      monthToUse &&
      yearToUse &&
      projectIdToUse &&
      associateIdToUse &&
      projectNameToUse &&
      associateNameToUse &&
      accountIdToUse &&
      accountNameToUse
    ) {
      // Check for context change
      if (
        monthToUse !== activeMonth ||
        yearToUse !== activeYear ||
        projectIdToUse !== activeProjectId ||
        associateIdToUse !== activeAssociateId ||
        accountIdToUse !== activeAccountId ||
        sbuToUse !== activeSbu ||
        projectTypeToUse !== activeProjectType
      ) {
        setActiveMonth(monthToUse);
        setActiveYear(yearToUse);
        setActiveProjectId(projectIdToUse);
        setActiveAssociateId(associateIdToUse);
        setActiveProjectName(projectNameToUse);
        setActiveAssociateName(associateNameToUse);
        setActiveAccountId(accountIdToUse);
        setActiveAccountName(accountNameToUse);
        setActiveSbu(sbuToUse);
        setActiveProjectType(projectTypeToUse);

        sessionStorage.setItem('lastFetchedDateMonth', monthToUse.toString());
        sessionStorage.setItem('lastFetchedDateYear', yearToUse.toString());
        sessionStorage.setItem('lastFetchedDateProjectId', projectIdToUse);
        sessionStorage.setItem('lastFetchedDateAssociateId', associateIdToUse);
        sessionStorage.setItem('lastFetchedDateProjectName', projectNameToUse);
        sessionStorage.setItem('lastFetchedDateAssociateName', associateNameToUse);
        sessionStorage.setItem('lastFetchedDateAccountId', accountIdToUse);
        sessionStorage.setItem('lastFetchedDateAccountName', accountNameToUse);
        if (sbuToUse) {
          sessionStorage.setItem('lastFetchedDateSbu', sbuToUse);
        }
        if (projectTypeToUse) {
          sessionStorage.setItem('lastFetchedDateProjectType', projectTypeToUse);
        }

        fetchDailyHoursData(monthToUse, yearToUse, projectIdToUse, associateIdToUse);
      } else {
        setLoading(false);
      }
    } else {
      setError('Missing daily hours context. Please go back and select an associate.');
      setLoading(false);
    }
  }, [
    location.state,
    urlProjectId,
    urlAssociateId,
    activeMonth,
    activeYear,
    activeProjectId,
    activeAssociateId,
    activeAccountId,
    activeSbu,
    activeProjectType
  ]);

  // Initialize & update DataTable
  useEffect(() => {
    const tableEl = tableRef.current;

    if (tableEl && !dataTableInstance.current) {
      dataTableInstance.current = $(tableEl).DataTable({
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: false,
        data: dailyHours,
        columns: [
          { data: 'date' },
          { data: 'associateId' },
          { data: 'associateName' },
          { data: 'projectId' },
          { data: 'projectName' },
          { data: 'companyHours' },
          { data: 'clientHours' },
          {
            data: 'varianceTimeUnits',
            render: (data, type, row) => {
              const variance = data != null ? data : row.companyHours - row.clientHours;
              let className = '';
              if (variance > 0) className = 'text-danger';
              else if (variance < 0) className = 'text-primary';
              else className = 'text-success';
              return `<span class="fw-semibold ${className}">${variance}</span>`;
            }
          },
          { data: 'comparisonResult' }
        ]
      });
    } else if (dataTableInstance.current && !loading) {
      dataTableInstance.current.clear().rows.add(dailyHours).draw();
    }

    return () => {
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
        dataTableInstance.current = null;
      }
    };
  }, [loading, dailyHours]);

  // Build breadcrumb path
  const breadcrumbPath = [
    { name: 'PMO Dashboard', page: '' },
    { name: 'Revenue Forecast - Early View', page: 'upload' },
    ...(activeSbu
      ? [
          {
            name: `${activeSbu} SBU Level`,
            page: 'sbu',
            state: { month: activeMonth, year: activeYear, sbu: activeSbu }
          }
        ]
      : []),
    {
      name: 'Account Level',
      page: `accounts`,
      state: { month: activeMonth, year: activeYear, sbu: activeSbu }
    },
    ...(activeProjectType
      ? [
          {
            name: `${activeProjectType} Project Type`,
            page: `accounts/${activeAccountId}/project-types`,
            state: {
              month: activeMonth,
              year: activeYear,
              sbu: activeSbu,
              accId: activeAccountId
            }
          }
        ]
      : []),
    {
      name: `Projects (${activeAccountName})`,
      page: `accounts/${activeAccountId}/projects`,
      state: {
        month: activeMonth,
        year: activeYear,
        sbu: activeSbu,
        accId: activeAccountId,
        accountName: activeAccountName,
        projectType: activeProjectType
      }
    },
    {
      name: `Associates (${activeProjectName})`,
      page: `projects/${activeProjectId}/associates`,
      state: {
        month: activeMonth,
        year: activeYear,
        projectId: activeProjectId,
        projectName: activeProjectName,
        accountId: activeAccountId,
        accountName: activeAccountName,
        sbu: activeSbu,
        projectType: activeProjectType
      }
    },
    {
      name: `Daily View (${activeAssociateName})`,
      page: `projects/${activeProjectId}/associates/${activeAssociateId}/daily`
    }
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="ms-3 text-primary">Loading Daily Hours Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-danger">
        <p className="fs-4">Error: {error}</p>
        <button
          className="btn btn-primary mt-3"
          onClick={() =>
            navigate(`/projects/${activeProjectId}/associates`, {
              state: {
                month: activeMonth,
                year: activeYear,
                projectId: activeProjectId,
                projectName: activeProjectName,
                accountId: activeAccountId,
                accountName: activeAccountName,
                sbu: activeSbu,
                projectType: activeProjectType
              }
            })
          }
        >
          Go to Associate Level
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"
      style={{
        background: 'linear-gradient(to bottom right, #f8fafc, #e0e7ef)',
        fontFamily: "'Poppins', sans-serif"
      }}
    >
      <div
        className="card shadow p-4 w-100"
        style={{
          maxWidth: '950px',
          backgroundColor: '#ffffffee',
          borderRadius: '1rem'
        }}
      >
        <Breadcrumbs path={breadcrumbPath} />

        <h2 className="text-center mb-4 fw-semibold text-dark">
          📅 Daily Hours – {activeAssociateName}
        </h2>

        <div className="table-responsive rounded">
          <table
            ref={tableRef}
            className="display table table-hover table-borderless align-middle mb-0"
            style={{ width: '100%' }}
          >
            <thead>
              <tr
                style={{
                  background: 'linear-gradient(to right, #60a5fa, #3b82f6)',
                  color: 'white'
                }}
              >
                <th>Date</th>
                <th>Associate ID</th>
                <th>Associate Name</th>
                <th>Project ID</th>
                <th>Project Name</th>
                <th>Company Hours</th>
                <th>Client Hours</th>
                <th>Variance Time Units</th>
                <th>Comparison Result</th>
              </tr>
            </thead>
            <tbody />
          </table>
        </div>
      </div>
    </div>
  );
};

export default DateLevel;

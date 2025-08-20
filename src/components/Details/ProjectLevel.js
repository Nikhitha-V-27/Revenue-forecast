import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Breadcrumbs from "../Breadcrumbs";
import commonData from "../../data/commonData.json";
 
// The backend URL remains the same.
const BACKEND_URL = "http://localhost:8081";
 
// A new, pure React component for pagination controls.
const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }
 
  if (pageNumbers.length <= 1) {
    return null; // Don't show pagination if there's only one page.
  }
 
  return (
    <nav className="mt-4 d-flex justify-content-center">
      <ul className="pagination rounded-pill">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <a
            onClick={() => paginate(currentPage - 1)}
            href="#!"
            className="page-link"
          >
            Previous
          </a>
        </li>
        {pageNumbers.map((number) => (
          <li
            key={number}
            className={`page-item ${currentPage === number ? "active" : ""}`}
          >
            <a onClick={() => paginate(number)} href="#!" className="page-link">
              {number}
            </a>
          </li>
        ))}
        <li
          className={`page-item ${
            currentPage === pageNumbers.length ? "disabled" : ""
          }`}
        >
          <a
            onClick={() => paginate(currentPage + 1)}
            href="#!"
            className="page-link"
          >
            Next
          </a>
        </li>
      </ul>
    </nav>
  );
};
 
const ProjectLevel = () => {
  const navigate = useNavigate();
  const { accountId: urlAccountId } = useParams();
  const location = useLocation();
 
  // State management remains mostly the same, but no more tableRef.
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [activeAccountName, setActiveAccountName] = useState("Loading...");
  const [activeSbu, setActiveSbu] = useState(null);
  const [activeProjectType, setActiveProjectType] = useState(null);
  const [columnFilters, setColumnFilters] = useState({});
 
  // New state for React-based pagination.
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // You can make this dynamic if you want.
 
  // Helper functions are unchanged.
  const formatCurrency = (value = 0) =>
    value.toLocaleString(commonData.currencySettings.locale, {
      style: "currency",
      currency: commonData.currencySettings.currency,
      minimumFractionDigits: commonData.currencySettings.minimumFractionDigits,
      maximumFractionDigits: commonData.currencySettings.maximumFractionDigits,
    });
 
  const getMonthName = (monthNumber) => {
    if (!monthNumber) return "";
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString("en-US", { month: "long" });
  };
 
  // ✅ CORE LOGIC CHANGE: Filtering is now done in React using useMemo for efficiency.
  // This creates a new `filteredProjects` array whenever the original projects or filters change.
  const filteredProjects = useMemo(() => {
    let filteredData = [...projects];
    Object.entries(columnFilters).forEach(([key, value]) => {
      // If a filter value is present (not "All" or null)
      if (value) {
        filteredData = filteredData.filter((project) => {
          const projectValue = project[key];
          if (projectValue === null || projectValue === undefined) {
            return false;
          }
          // Specific logic for revenue column
          if (key === "revenue") {
            return formatCurrency(projectValue) === String(value);
          }
          // Logic for all other columns
          return (
            String(projectValue).toLowerCase() === String(value).toLowerCase()
          );
        });
      }
    });
    return filteredData;
  }, [projects, columnFilters]);
 
  // This function is now used for both CSV and can be simplified.
  const handleDownloadData = () => {
    if (filteredProjects.length === 0) {
      console.log("No data to download.");
      return;
    }
    const headers = [
      "Project ID",
      "Project Name",
      "Total Associates",
      "Company Hours",
      "Client Hours",
      "Variance Hours",
      "Revenue",
    ];
    const csvRows = filteredProjects.map((project) => {
      return [
        `"${project.projectId}"`,
        `"${project.projectName}"`,
        project.totalAssociatesCount,
        project.totalCompanyHours,
        project.totalClientHours,
        project.varianceHours,
        `"${formatCurrency(project.revenue)}"`,
      ].join(",");
    });
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const monthName = getMonthName(activeMonth);
    const fileName = `Projects_Account_${activeAccountId}_${monthName}_${activeYear}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
 
  const getUniqueOptions = (columnKey) => {
    if (!projects || projects.length === 0) {
      return ["All"];
    }
    const options = projects.map((project) => {
      const value = project[columnKey];
      return columnKey === "revenue" ? formatCurrency(value) : String(value);
    });
    const uniqueOptions = [...new Set(options)].sort((a, b) => {
      const isNumericColumn = [
        "totalAssociatesCount",
        "totalCompanyHours",
        "totalClientHours",
        "varianceHours",
      ].includes(columnKey);
      if (isNumericColumn) {
        return Number(a) - Number(b);
      }
      if (columnKey === "revenue") {
        const numA = parseFloat(a.replace(/[^0-9.-]+/g, ""));
        const numB = parseFloat(b.replace(/[^0-9.-]+/g, ""));
        return numA - numB;
      }
      return a.localeCompare(b);
    });
    return ["All", ...uniqueOptions];
  };
 
  const handleFilterChange = (columnKey, value) => {
    setColumnFilters((prevFilters) => ({
      ...prevFilters,
      [columnKey]: value === "All" ? null : value,
    }));
    setCurrentPage(1); // Reset to the first page whenever a filter changes.
  };
 
  // Data fetching logic is solid and remains unchanged.
  useEffect(() => {
    const fetchProjectData = async (month, year, accId, projectType) => {
      setLoading(true);
      setError(null);
      try {
        const payload = { month, year, accId, projectType };
        const resp = await fetch(`${BACKEND_URL}/api/project`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(
            `status: ${resp.status}, message: ${errText || resp.statusText}`
          );
        }
        const data = await resp.json();
        const list = Array.isArray(data) ? data : data ? [data] : [];
        setProjects(list);
        setColumnFilters({});
        if (list.length > 0 && list[0].accountName) {
          setActiveAccountName(list[0].accountName);
        } else {
          const storedName = sessionStorage.getItem(
            "lastFetchedProjectAccountName"
          );
          setActiveAccountName(storedName || accId);
        }
      } catch (e) {
        console.error("Error fetching project data:", e);
        setError(`Failed to load project data: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
 
    let monthToUse =
      location.state?.month ||
      sessionStorage.getItem("lastFetchedProjectMonth");
    let yearToUse =
      location.state?.year || sessionStorage.getItem("lastFetchedProjectYear");
    let accountIdToUse = urlAccountId;
    let accountNameToUse =
      location.state?.accountName ||
      sessionStorage.getItem("lastFetchedProjectAccountName");
    let sbuToUse =
      location.state?.sbu || sessionStorage.getItem("lastFetchedProjectSbu");
    let projectTypeToUse =
      location.state?.projectType ||
      sessionStorage.getItem("lastFetchedProjectType");
 
    monthToUse = monthToUse ? parseInt(monthToUse, 10) : null;
    yearToUse = yearToUse ? parseInt(yearToUse, 10) : null;
 
    if (monthToUse && yearToUse && accountIdToUse) {
      const hasParamsChanged =
        monthToUse !== activeMonth ||
        yearToUse !== activeYear ||
        accountIdToUse !== activeAccountId ||
        sbuToUse !== activeSbu ||
        projectTypeToUse !== activeProjectType;
      if (activeMonth === null || hasParamsChanged) {
        setActiveMonth(monthToUse);
        setActiveYear(yearToUse);
        setActiveAccountId(accountIdToUse);
        if (accountNameToUse) setActiveAccountName(accountNameToUse);
        setActiveSbu(sbuToUse);
        setActiveProjectType(projectTypeToUse);
 
        sessionStorage.setItem(
          "lastFetchedProjectMonth",
          monthToUse.toString()
        );
        sessionStorage.setItem("lastFetchedProjectYear", yearToUse.toString());
        sessionStorage.setItem("lastFetchedProjectAccountId", accountIdToUse);
        if (accountNameToUse)
          sessionStorage.setItem(
            "lastFetchedProjectAccountName",
            accountNameToUse
          );
        if (sbuToUse) sessionStorage.setItem("lastFetchedProjectSbu", sbuToUse);
        if (projectTypeToUse)
          sessionStorage.setItem("lastFetchedProjectType", projectTypeToUse);
 
        fetchProjectData(
          monthToUse,
          yearToUse,
          accountIdToUse,
          projectTypeToUse
        );
      }
    } else {
      setError(
        "Missing month, year, or Account ID. Please navigate here with all parameters."
      );
      setLoading(false);
    }
  }, [
    location.state,
    urlAccountId,
    activeMonth,
    activeYear,
    activeAccountId,
    activeSbu,
    activeProjectType,
  ]);
 
  // Font loading is unchanged.
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Poppins', sans-serif";
  }, []);
 
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProjects.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
 
  // Breadcrumb path logic is unchanged.
  const breadcrumbPath = [
    { name: "PMO Dashboard", page: "" },
    { name: "Revenue Forecast - Early View", page: "upload" },
    ...(activeSbu
      ? [
          {
            name: `${activeSbu} SBU Level`,
            page: "sbu",
            state: { month: activeMonth, year: activeYear, sbu: activeSbu },
          },
        ]
      : []),
    {
      name: "Account Level",
      page: `accounts`,
      state: { month: activeMonth, year: activeYear, sbu: activeSbu },
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
              accId: activeAccountId,
            },
          },
        ]
      : []),
    {
      name: `Projects (${activeAccountName})`,
      page: `accounts/${activeAccountId}/projects`,
    },
  ].filter(Boolean);
 
  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="ms-3 text-primary">Loading Project Data...</p>
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
            navigate("/accounts", {
              state: { month: activeMonth, year: activeYear, sbu: activeSbu },
            })
          }
        >
          Go to Account Level
        </button>
      </div>
    );
  }
 
  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"
      style={{
        background: "linear-gradient(to bottom right, #f5f7fa, #e9ecef)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        className="card shadow p-4 p-md-5 w-100"
        style={{
          maxWidth: "1200px",
          backgroundColor: "#ffffffdd",
          borderRadius: "1rem",
        }}
      >
        <Breadcrumbs path={breadcrumbPath} />
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 fw-semibold text-dark">
            📁 Project Level Overview{" "}
            {activeAccountId ? `for ${activeAccountName}` : ""}
          </h2>
          {projects.length > 0 && (
            <button
              className="btn btn-outline-success rounded-pill px-3"
              onClick={handleDownloadData}
              title="Download Project Data"
            >
              <i className="bi bi-download me-2"></i> Download Data
            </button>
          )}
        </div>
        <div className="table-responsive rounded">
          {/* The table no longer needs a ref or any DataTables-specific classes. */}
          <table
            className="table table-hover align-middle table-borderless mb-0"
            style={{ width: "100%" }}
          >
            <thead
              className="text-white"
              style={{
                background: "linear-gradient(to right, #3b82f6, #2563eb)",
              }}
            >
              <tr>
                <th>
                  Project ID{" "}
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) =>
                      handleFilterChange("projectId", e.target.value)
                    }
                    value={columnFilters.projectId || "All"}
                  >
                    {getUniqueOptions("projectId").map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </th>
                <th>
                  Project Name{" "}
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) =>
                      handleFilterChange("projectName", e.target.value)
                    }
                    value={columnFilters.projectName || "All"}
                  >
                    {getUniqueOptions("projectName").map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </th>
                <th>
                  Total Associates{" "}
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) =>
                      handleFilterChange("totalAssociatesCount", e.target.value)
                    }
                    value={columnFilters.totalAssociatesCount || "All"}
                  >
                    {getUniqueOptions("totalAssociatesCount").map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </th>
                <th>
                  Company Hours{" "}
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) =>
                      handleFilterChange("totalCompanyHours", e.target.value)
                    }
                    value={columnFilters.totalCompanyHours || "All"}
                  >
                    {getUniqueOptions("totalCompanyHours").map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </th>
                <th>
                  Client Hours{" "}
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) =>
                      handleFilterChange("totalClientHours", e.target.value)
                    }
                    value={columnFilters.totalClientHours || "All"}
                  >
                    {getUniqueOptions("totalClientHours").map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </th>
                <th>
                  Variance Hours{" "}
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) =>
                      handleFilterChange("varianceHours", e.target.value)
                    }
                    value={columnFilters.varianceHours || "All"}
                  >
                    {getUniqueOptions("varianceHours").map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </th>
                <th>
                  Revenue{" "}
                  <select
                    className="form-select form-select-sm mt-1"
                    onChange={(e) =>
                      handleFilterChange("revenue", e.target.value)
                    }
                    value={columnFilters.revenue || "All"}
                  >
                    {getUniqueOptions("revenue").map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="text-center">View</th>
              </tr>
            </thead>
            <tbody>
              {/* We now map over the `currentItems` which is the paginated and filtered list. */}
              {currentItems.length > 0 ? (
                currentItems.map((project) => (
                  <tr key={project.projectId}>
                    <td>{project.projectId}</td>
                    <td>{project.projectName}</td>
                    <td>{project.totalAssociatesCount}</td>
                    <td>{project.totalCompanyHours}</td>
                    <td>{project.totalClientHours}</td>
                    <td>{project.varianceHours}</td>
                    <td>{formatCurrency(project.revenue)}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary rounded-circle"
                        onClick={() =>
                          navigate(
                            `/projects/${project.projectId}/associates`,
                            {
                              state: {
                                ...project,
                                month: activeMonth,
                                year: activeYear,
                                sbu: activeSbu,
                                projectType: activeProjectType,
                              },
                            }
                          )
                        }
                        title="View Associates"
                      >
                        🔍
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-4">
                    No matching projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Render the new pagination component */}
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={filteredProjects.length}
          paginate={paginate}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};
 
export default ProjectLevel;
 
 
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Dashboard from './components/Dashboard/Dashboard';
// import UploadFiles from './components/Upload/UploadFiles';
// import ProjectLevel from './components/Details/ProjectLevel';
// import AssociateLevel from './components/Details/AssociateLevel';
// import DateLevel from './components/Details/DateLevel';
// import 'react-datepicker/dist/react-datepicker.css'; 

// const App = () => (
//   <div className="min-vh-100 bg-light">
//     <link
//       rel="stylesheet"
//       href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
//       crossOrigin="anonymous"
//     />
//     <Router>
//       <Routes>
//         <Route path="/" element={<Dashboard />} />
//         <Route path="/upload" element={<UploadFiles />} />
//         <Route path="/projects" element={<ProjectLevel />} />
//         <Route path="/projects/:projectId/associates" element={<AssociateLevel />} />
//         <Route path="/projects/:projectId/associates/:associateId" element={<DateLevel />} />
//         <Route path="*" element={<Dashboard />} />
//       </Routes>
//     </Router>
//   </div>
// );

// export default App;

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Dashboard from './components/Dashboard/Dashboard';
// import UploadFiles from './components/Upload/UploadFiles';
// // CORRECTED PATH for AccountLevel, assuming it's in components/Details/
// import AccountLevel from './components/Details/AccountLevel';
// // Paths for ProjectLevel, AssociateLevel, DateLevel are already correct
// import ProjectLevel from './components/Details/ProjectLevel';
// import AssociateLevel from './components/Details/AssociateLevel';
// import DateLevel from './components/Details/DateLevel';
// import 'react-datepicker/dist/react-datepicker.css';

// const App = () => (
//   <div className="min-vh-100 bg-light">
//     {/* Bootstrap CSS link - kept here as per your provided App.js */}
//     <link
//       rel="stylesheet"
//       href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
//       crossOrigin="anonymous"
//     />
//     <Router>
//       <Routes>
//         {/* Main Dashboard Route */}
//         <Route path="/" element={<Dashboard />} />
//         {/* Upload Timesheet Page Route */}
//         <Route path="/upload" element={<UploadFiles />} />

//         {/* Reconciliation Levels */}
//         {/* Account Level: New entry point after "Start Reconciliation" */}
//         <Route path="/accounts" element={<AccountLevel />} />
//         {/* Project Level: Filtered by accountId. This is the primary route for the reconciliation flow. */}
//         <Route path="/accounts/:accountId/projects" element={<ProjectLevel />} />
//         {/* Optional: General Project Level view (if you need to see all projects without account filter) */}
//         <Route path="/projects" element={<ProjectLevel />} />
//         {/* Associate Level: Filtered by projectId (path remains the same) */}
//         <Route path="/projects/:projectId/associates" element={<AssociateLevel />} />
//         {/* Date Level: Filtered by projectId and associateId (path remains the same) */}
//         <Route path="/projects/:projectId/associates/:associateId/daily" element={<DateLevel />} />

//         {/* Fallback route - redirects to Dashboard for any unhandled paths */}
//         <Route path="*" element={<Dashboard />} />
//       </Routes>
//     </Router>
//   </div>
// );

// export default App;

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// import Dashboard from './components/Dashboard/Dashboard';
// import UploadFiles from './components/Upload/UploadFiles';
// import AccountLevel from './components/Details/AccountLevel';
// import ProjectTypeLevel from './components/Details/ProjectTypeLevel';
// import ProjectLevel from './components/Details/ProjectLevel';
// import AssociateLevel from './components/Details/AssociateLevel';
// import DateLevel from './components/Details/DateLevel';

// import 'react-datepicker/dist/react-datepicker.css';

// const App = () => (
//   <div className="min-vh-100 bg-light">
//     {/* Bootstrap CSS via CDN */}
//     <link
//       rel="stylesheet"
//       href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
//       crossOrigin="anonymous"
//     />

//     <Router>
//       <Routes>
//         {/* Home */}
//         <Route path="/" element={<Dashboard />} />

//         {/* Upload */}
//         <Route path="/upload" element={<UploadFiles />} />

//         {/* Account-level */}
//         <Route path="/accounts" element={<AccountLevel />} />

//         {/* Project-type level (fired by AccountLevel “View” button) */}
//         <Route
//           path="/accounts/:accountId/project-type"
//           element={<ProjectTypeLevel />}
//         />

//         {/* Project-level (fired by ProjectTypeLevel “View” button) */}
//         <Route
//           path="/accounts/:accountId/project-type/:projectType/projects"
//           element={<ProjectLevel />}
//         />

//         {/* Associate-level */}
//         <Route
//           path="/projects/:projectId/associates"
//           element={<AssociateLevel />}
//         />

//         {/* Date-level */}
//         <Route
//           path="/projects/:projectId/associates/:associateId/daily"
//           element={<DateLevel />}
//         />

//         {/* Fallback */}
//         <Route path="*" element={<Dashboard />} />
//       </Routes>
//     </Router>
//   </div>
// );

// export default App;

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Dashboard from './components/Dashboard/Dashboard';
// import UploadFiles from './components/Upload/UploadFiles';
// import AccountLevel from './components/Details/AccountLevel';
// import ProjectLevel from './components/Details/ProjectLevel';
// import AssociateLevel from './components/Details/AssociateLevel';
// import DateLevel from './components/Details/DateLevel';
// import SbuLevel from './components/Details/SbuLevel';          // ← New import
// import 'react-datepicker/dist/react-datepicker.css';

// const App = () => (
//   <div className="min-vh-100 bg-light">
//     {/* Bootstrap CSS */}
//     <link
//       rel="stylesheet"
//       href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
//       crossOrigin="anonymous"
//     />

//     <Router>
//       <Routes>
//         {/* Main Dashboard */}
//         <Route path="/" element={<Dashboard />} />

//         {/* File Upload */}
//         <Route path="/upload" element={<UploadFiles />} />

//         {/* Reconciliation Flow */}
//         <Route path="/accounts" element={<AccountLevel />} />
//         <Route path="/accounts/:accountId/projects" element={<ProjectLevel />} />
//         <Route path="/projects" element={<ProjectLevel />} />
//         <Route path="/projects/:projectId/associates" element={<AssociateLevel />} />
//         <Route
//           path="/projects/:projectId/associates/:associateId/daily"
//           element={<DateLevel />}
//         />

//         {/* SBU Revenue Summary */}
//         <Route path="/sbu" element={<SbuLevel />} />          {/* ← New route */}

//         {/* Fallback */}
//         <Route path="*" element={<Dashboard />} />
//       </Routes>
//     </Router>
//   </div>
// );

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import UploadFiles from './components/Upload/UploadFiles';
import AccountLevel from './components/Details/AccountLevel';
import ProjectLevel from './components/Details/ProjectLevel';
import AssociateLevel from './components/Details/AssociateLevel';
import DateLevel from './components/Details/DateLevel';
import SbuLevel from './components/Details/SbuLevel';
import ProjectTypeLevel from './components/Details/ProjectTypeLevel'; // New import for ProjectTypeLevel
import 'react-datepicker/dist/react-datepicker.css';

const App = () => (
  <div className="min-vh-100 bg-light">
    {/* Bootstrap CSS */}
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      crossOrigin="anonymous"
    />

    <Router>
      <Routes>
        {/* Main Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* File Upload */}
        <Route path="/upload" element={<UploadFiles />} />

        {/* Reconciliation Flow */}
        <Route path="/sbu" element={<SbuLevel />} /> {/* SBU Level */}
        <Route path="/accounts" element={<AccountLevel />} /> {/* Account Level */}
        {/* Project Type Level: New route for navigating from Account Level */}
        <Route path="/accounts/:accountId/project-types" element={<ProjectTypeLevel />} />
        <Route path="/accounts/:accountId/projects" element={<ProjectLevel />} /> {/* Original Project Level */}
        <Route path="/projects" element={<ProjectLevel />} />
        <Route path="/projects/:projectId/associates" element={<AssociateLevel />} />
        <Route
          path="/projects/:projectId/associates/:associateId/daily"
          element={<DateLevel />}
        />

        {/* Fallback */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  </div>
);

export default App;

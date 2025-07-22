// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import UploadCard from './UploadCard';
// import Breadcrumbs from '../Breadcrumbs'; // Ensure this path is correct
// import uploadData from '../../data/uploadPage.json';
// import DatePicker from 'react-datepicker'; // Import DatePicker
// // REMEMBER: The CSS import for react-datepicker should be in App.js or index.js

// const UploadFiles = () => {
//   // States to track if files are selected (chosen from dialog)
//   const [teamSelected, setTeamSelected] = useState(false);
//   const [customerSelected, setCustomerSelected] = useState(false);
//   const [associateMappingSelected, setAssociateMappingSelected] = useState(false);

//   // States to track if files are uploaded (processed)
//   const [teamUploaded, setTeamUploaded] = useState(false);
//   const [customerUploaded, setCustomerUploaded] = useState(false);
//   const [associateMappingUploaded, setAssociateMappingUploaded] = useState(false);

//   // States to store the names of the selected/uploaded files
//   const [teamFileName, setTeamFileName] = useState('');
//   const [customerFileName, setCustomerFileName] = useState('');
//   const [associateMappingFileName, setAssociateMappingFileName] = useState('');

//   // State to control the visibility of the "Get Data" (Month/Year) popup
//   const [showGetDataPopup, setShowGetDataPopup] = useState(false);
//   // State for selected date in the popup
//   const [selectedDate, setSelectedDate] = useState(null); 

//   const navigate = useNavigate(); // Hook for navigation

//   // Effect to load Poppins font on component mount
//   useEffect(() => {
//     const link = document.createElement('link');
//     link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
//     link.rel = 'stylesheet';
//     document.head.appendChild(link);
//     document.body.style.fontFamily = "'Poppins', sans-serif";
//   }, []);

//   // Handler for when a file is chosen from the file dialog (sets 'selected' state)
//   const handleFileSelect = (type, file) => {
//     if (!file) return; // If no file was selected
//     const name = file.name || 'Unnamed file';
//     if (type === 'team') {
//       setTeamSelected(true);
//       setTeamFileName(name);
//     } else if (type === 'customer') {
//       setCustomerSelected(true);
//       setCustomerFileName(name);
//     } else if (type === 'associateMapping') {
//       setAssociateMappingSelected(true);
//       setAssociateMappingFileName(name);
//     }
//   };

//   // Handler for when the "Upload" button is clicked (sets 'uploaded' state)
//   const handleProcessUpload = (type) => {
//     // In a real app, you'd send the file to a server here.
//     // For this demo, we just set the 'uploaded' state.
//     if (type === 'team') {
//       setTeamUploaded(true);
//     } else if (type === 'customer') {
//       setCustomerUploaded(true);
//     } else if (type === 'associateMapping') {
//       setAssociateMappingUploaded(true);
//     }
//     // You might want to show a loading spinner or success message here.
//   };

//   // Handler to remove a file (resets both 'selected' and 'uploaded' states)
//   const handleRemoveFile = (type) => {
//     if (type === 'team') {
//       setTeamSelected(false);
//       setTeamUploaded(false);
//       setTeamFileName('');
//     } else if (type === 'customer') {
//       setCustomerSelected(false);
//       setCustomerUploaded(false);
//       setCustomerFileName('');
//     } else if (type === 'associateMapping') {
//       setAssociateMappingSelected(false);
//       setAssociateMappingUploaded(false);
//       setAssociateMappingFileName('');
//     }
//   };

//   // Handler for "Start Reconciliation" button in the Month/Year popup
//   const handleStartReconciliation = () => {
//     if (!selectedDate) {
//       alert('Please select both a month and a year.');
//       return;
//     }
//     setShowGetDataPopup(false); // Close the popup
//     navigate('/accounts'); // Navigate to the account level
//   };

//   // Breadcrumb path for navigation
//   const breadcrumbPath = [
//     { name: 'PMO Dashboard', page: '' },
//     { name: 'Revenue Forecast - Early View', page: 'upload' }
//   ];

//   // Determine if the "Get Data" button should be enabled (at least first two sheets uploaded)
//   const isGetDataButtonEnabled = teamUploaded && customerUploaded;

//   return (
//     <div
//       className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"
//       style={{
//         background: 'linear-gradient(to bottom right, #e0f2fe, #f8fafc)'
//       }}
//     >
//       <div className="card shadow p-4 p-md-5 w-100" style={{ maxWidth: '960px', backgroundColor: '#ffffffee' }}>
//         <Breadcrumbs path={breadcrumbPath} /> {/* Display breadcrumbs */}
//         <h2 className="text-center fw-bold text-dark mb-3">Revenue Forecast – Early View</h2>

//         {/* Tab Navigation */}
//         <ul className="nav nav-pills nav-fill mb-5" role="tablist">
//           {uploadData.tabs.map((tab, i) => (
//             <li className="nav-item" key={i}>
//               <button
//                 type="button"
//                 className={`nav-link rounded-pill px-4 py-2 ${tab === 'Early View' ? 'active' : 'text-muted'}`}
//                 style={{ fontWeight: 500 }}
//               >
//                 {tab}
//               </button>
//             </li>
//           ))}
//         </ul>

//         <h4 className="fw-semibold text-dark mb-4">Upload Required Files</h4>

//         {/* Upload Cards Section */}
//         <div className="row g-4 mb-4">
//           {uploadData.cards.map((card) => {
//             let currentSelected, currentUploaded, currentFileName;
//             if (card.type === 'team') {
//               currentSelected = teamSelected;
//               currentUploaded = teamUploaded;
//               currentFileName = teamFileName;
//             } else if (card.type === 'customer') {
//               currentSelected = customerSelected;
//               currentUploaded = customerUploaded;
//               currentFileName = customerFileName;
//             } else if (card.type === 'associateMapping') {
//               currentSelected = associateMappingSelected;
//               currentUploaded = associateMappingUploaded;
//               currentFileName = associateMappingFileName;
//             }

//             return (
//               <UploadCard
//                 key={card.type}
//                 title={card.title}
//                 description={card.description}
//                 icon={card.icon}
//                 onFileSelect={(e) => handleFileSelect(card.type, e.target.files[0])}
//                 onProcessUpload={() => handleProcessUpload(card.type)}
//                 onRemove={() => handleRemoveFile(card.type)}
//                 isSelected={currentSelected}
//                 uploaded={currentUploaded}
//                 fileName={currentFileName}
//                 // Removed the 'disabled' prop here. UploadCard now manages its internal button disabling.
//               />
//             );
//           })}
//         </div>

//         {/* "Get Data" Button - Appears only after both Team and Customer files are uploaded */}
//         {isGetDataButtonEnabled && (
//           <div className="text-center mt-5"> {/* Added margin-top for spacing */}
//             <button
//               className="btn btn-primary px-5 py-2"
//               onClick={() => {
//                 setSelectedDate(null); // Reset date when opening
//                 setShowGetDataPopup(true); // Opens Month/Year popup
//               }}
//             >
//               Get Data
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Month/Year Selection Popup */}
//       {showGetDataPopup && (
//         <div
//           className="position-fixed top-50 start-50 translate-middle bg-white p-4 rounded shadow"
//           style={{ zIndex: 999, minWidth: '360px' }}
//         >
//           <h5 className="fw-bold mb-3 text-center">Select Month and Year</h5>
//           <div className="mb-3 text-center">
//             <DatePicker
//               selected={selectedDate}
//               onChange={(date) => setSelectedDate(date)}
//               dateFormat="MM/yyyy"
//               showMonthYearPicker
//               className="form-control text-center" // Apply Bootstrap styling
//               placeholderText="Select Month & Year"
//             />
//           </div>
//           <button className="btn btn-primary w-100 mb-2" onClick={handleStartReconciliation}>
//             Start Reconciliation
//           </button>
//           <button className="btn btn-outline-secondary w-100" onClick={() => setShowGetDataPopup(false)}>
//             Cancel
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UploadFiles;

import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import UploadCard from './UploadCard';

import Breadcrumbs from '../Breadcrumbs'; 

import uploadData from '../../data/uploadPage.json';

import DatePicker from 'react-datepicker';

// REMEMBER: The CSS import for react-datepicker should be in App.js or index.js


const LoadingSpinner = () => (

  <div className="d-flex justify-content-center align-items-center">

    <div className="spinner-border text-primary" role="status">

      <span className="visually-hidden">Loading...</span>

    </div>

    <span className="ms-2 text-primary">Uploading...</span>

  </div>

);

const UploadFiles = () => {

  const navigate = useNavigate();

  // **IMPORTANT**: Replace with your actual Spring Boot backend URL

  const BACKEND_URL = 'http://localhost:8081';

  // States to track the actual File objects selected by the user

  const [teamFile, setTeamFile] = useState(null);

  const [customerFile, setCustomerFile] = useState(null);

  const [associateMappingFile, setAssociateMappingFile] = useState(null);

  // States to store the names of the selected/uploaded files (for display)

  const [teamFileName, setTeamFileName] = useState('');

  const [customerFileName, setCustomerFileName] = useState('');

  const [associateMappingFileName, setAssociateMappingFileName] = useState('');

  // States to track if files have been successfully uploaded/processed by the backend

  const [teamUploaded, setTeamUploaded] = useState(false);

  const [customerUploaded, setCustomerUploaded] = useState(false);

  const [associateMappingUploaded, setAssociateMappingUploaded] = useState(false);

  // States to track loading status for each individual upload card

  const [teamLoading, setTeamLoading] = useState(false);

  const [customerLoading, setCustomerLoading] = useState(false);

  const [associateMappingLoading, setAssociateMappingLoading] = useState(false);

  // State for the "Get Data" popup visibility and selected date

  const [showGetDataPopup, setShowGetDataPopup] = useState(false);

  // Initialize selectedDate to null so DatePicker starts empty

  const [selectedDate, setSelectedDate] = useState(null);

  // Effect to load Poppins font (runs once on component mount)

  useEffect(() => {

    const link = document.createElement('link');

    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';

    link.rel = 'stylesheet';

    document.head.appendChild(link);

    document.body.style.fontFamily = "'Poppins', sans-serif";

  }, []);

  /**

   * Handles file selection from the file input dialog.

   * Stores the file object and its name in the component's state.

   * @param {string} type - The type of file ('team', 'customer', 'associateMapping').

   * @param {File} file - The File object selected by the user.

   */

  const handleFileSelect = (type, file) => {

    if (!file) return;

    const name = file.name || 'Unnamed file';

    if (type === 'team') {

      setTeamFile(file);

      setTeamFileName(name);

      setTeamUploaded(false); // Reset uploaded status if a new file is selected

    } else if (type === 'customer') {

      setCustomerFile(file);

      setCustomerFileName(name);

      setCustomerUploaded(false);

    } else if (type === 'associateMapping') {

      setAssociateMappingFile(file);

      setAssociateMappingFileName(name);

      setAssociateMappingUploaded(false);

    }

  };

  /**

   * Handles the "Upload" button click for each card.

   * Sends the selected file to the backend via a POST request.

   * @param {string} type - The type of file being uploaded ('team', 'customer', 'associateMapping').

   */

  const handleProcessUpload = async (type) => {

    let fileToUpload = null;

    let backendType = ''; // This will be 'company', 'client', or 'associate'

    let setLoading = null;

    let setUploaded = null;

    let fileNameForAlert = ''; // Used for user feedback

    let setFileState = null; // To clear the actual File object after successful upload

    // Determine which file and state setters to use based on the 'type'

    if (type === 'team') {

      fileToUpload = teamFile;

      backendType = 'company';

      setLoading = setTeamLoading;

      setUploaded = setTeamUploaded;

      fileNameForAlert = teamFileName;

      setFileState = setTeamFile;

    } else if (type === 'customer') {

      fileToUpload = customerFile;

      backendType = 'client';

      setLoading = setCustomerLoading;

      setUploaded = setCustomerUploaded;

      fileNameForAlert = customerFileName;

      setFileState = setCustomerFile;

    } else if (type === 'associateMapping') {

      fileToUpload = associateMappingFile;

      backendType = 'associate';

      setLoading = setAssociateMappingLoading;

      setUploaded = setAssociateMappingUploaded;

      fileNameForAlert = associateMappingFileName;

      setFileState = setAssociateMappingFile;

    }

    // Prevent upload if no file is selected for this card

    if (!fileToUpload) {

      alert(`Please select a file for ${type} before uploading.`);

      return;

    }

    setLoading(true); // Activate loading spinner

    const formData = new FormData();

    formData.append('file', fileToUpload); // 'file' matches @RequestParam("file")

    try {

      const response = await fetch(`${BACKEND_URL}/upload`, {

        method: 'POST',

        headers: {

          // Custom header for the file type, as expected by your Spring Boot @RequestHeader

          'type': backendType

        },

        body: formData, // FormData automatically sets 'Content-Type': 'multipart/form-data'

      });

      if (response.ok) { // Check for a successful HTTP status (200-299)

        console.log(`${type} file uploaded successfully!`);

        alert(`${type} file (${fileNameForAlert}) uploaded successfully!`); // Provide user feedback

        setUploaded(true); // Mark as successfully uploaded

        setFileState(null); // Clear the actual File object after successful upload

      } else {

        const errorText = await response.text(); // Get detailed error message from backend

        console.error(`Failed to upload ${type} file: ${response.status} - ${errorText}`);

        alert(`Failed to upload ${type} file (${fileNameForAlert}): ${errorText || response.statusText}`);

        setUploaded(false); // Ensure it's not marked as uploaded on failure

      }

    } catch (error) {

      // Catches network errors (e.g., server not running, no internet)

      console.error('Network error during file upload:', error);

      alert(`Network error during ${type} file upload. Please check your connection or server status.`);

      setUploaded(false);

    } finally {

      setLoading(false); // Deactivate loading spinner, regardless of success or failure

    }

  };

  /**

   * Handles the "Remove" button click for each card.

   * Resets the file, filename, uploaded status, and loading status for that card.

   * @param {string} type - The type of file being removed.

   */

  const handleRemoveFile = (type) => {

    if (type === 'team') {

      setTeamFile(null);

      setTeamFileName('');

      setTeamUploaded(false);

      setTeamLoading(false);

    } else if (type === 'customer') {

      setCustomerFile(null);

      setCustomerFileName('');

      setCustomerUploaded(false);

      setCustomerLoading(false);

    } else if (type === 'associateMapping') {

      setAssociateMappingFile(null);

      setAssociateMappingFileName('');

      setAssociateMappingUploaded(false);

      setAssociateMappingLoading(false);

    }

  };

  /**

   * Handles the "Start Reconciliation" button click in the Month/Year popup.

   * Extracts month and year and navigates to the accounts page.

   */

  const handleStartReconciliation = () => {

    if (!selectedDate) {

      alert('Please select both a month and a year.');

      return;

    }

    // Extract month (1-indexed) and year from the selected Date object

    const month = selectedDate.getMonth() + 1; // getMonth() is 0-indexed, so add 1

    const year = selectedDate.getFullYear();

    setShowGetDataPopup(false); // Close the popup

    // Navigate to the account level page, passing month and year as state

    navigate('/accounts', { state: { month: month, year: year } });

  };

  // Breadcrumb path configuration

  const breadcrumbPath = [

    { name: 'PMO Dashboard', page: '' },

    { name: 'Revenue Forecast - Early View', page: 'upload' }

  ];

  // Calculate maxDate for the DatePicker

  // This will be the last day of the previous month

  const today = new Date();

  const lastDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0); // Day 0 of current month is last day of previous month

  // Determine if the "Get Data" button should be enabled (requires Team and Customer files uploaded)

  const isGetDataButtonEnabled = teamUploaded && customerUploaded;

  return (

    <div

      className="min-vh-100 d-flex flex-column align-items-center px-3 py-4"

      style={{

        background: 'linear-gradient(to bottom right, #e0f2fe, #f8fafc)'

      }}

    >

      <div className="card shadow p-4 p-md-5 w-100" style={{ maxWidth: '960px', backgroundColor: '#ffffffee' }}>

        <Breadcrumbs path={breadcrumbPath} /> {/* Display breadcrumbs */}

        <h2 className="text-center fw-bold text-dark mb-3">Revenue Forecast – Early View</h2>

        {/* Tab Navigation */}

        <ul className="nav nav-pills nav-fill mb-5" role="tablist">

          {uploadData.tabs.map((tab, i) => (

            <li className="nav-item" key={i}>

              <button

                type="button"

                className={`nav-link rounded-pill px-4 py-2 ${tab === 'Early View' ? 'active' : 'text-muted'}`}

                style={{ fontWeight: 500 }}

              >

                {tab}

              </button>

            </li>

          ))}

        </ul>

        <h4 className="fw-semibold text-dark mb-4">Upload Required Files</h4>

        {/* Upload Cards Section */}

        <div className="row g-4 mb-4">

          {uploadData.cards.map((card) => {

            let currentFileState, currentFileNameState, currentUploadedState, currentLoadingState;

            let isDisabled = false; // Default to not disabled

            // Dynamically assign correct state and handlers based on card type

            if (card.type === 'team') {

              currentFileState = teamFile;

              currentFileNameState = teamFileName;

              currentUploadedState = teamUploaded;

              currentLoadingState = teamLoading;

            } else if (card.type === 'customer') {

              currentFileState = customerFile;

              currentFileNameState = customerFileName;

              currentUploadedState = customerUploaded;

              currentLoadingState = customerLoading;

            } else if (card.type === 'associateMapping') {

              currentFileState = associateMappingFile;

              currentFileNameState = associateMappingFileName;

              currentUploadedState = associateMappingUploaded;

              currentLoadingState = associateMappingLoading;

              // Disable associate mapping until team and customer are uploaded

              isDisabled = !teamUploaded || !customerUploaded; // <--- This line disables the card

            }

            return (

              <UploadCard

                key={card.type}

                title={card.title}

                description={card.description}

                icon={card.icon}

                onFileSelect={(e) => handleFileSelect(card.type, e.target.files[0])}

                onProcessUpload={() => handleProcessUpload(card.type)}

                onRemove={() => handleRemoveFile(card.type)}

                isSelected={!!currentFileState} // True if a file object exists

                uploaded={currentUploadedState} // Reflects if upload was successful

                fileName={currentFileNameState}

                disabled={isDisabled} // Pass the calculated disabled state to UploadCard

              >

                {/* Render loading spinner as children when currentLoading is true */}

                {currentLoadingState && <LoadingSpinner />}

              </UploadCard>

            );

          })}

        </div>

        {/* "Get Data" Button - Appears only after both Team and Customer files are uploaded */}

        {isGetDataButtonEnabled && ( // <--- This condition ensures the button only appears when both are uploaded

          <div className="text-center mt-5">

            <button

              className="btn btn-primary px-5 py-2"

              onClick={() => {

                setSelectedDate(null); // Set to null to make DatePicker empty initially

                setShowGetDataPopup(true); // Open Month/Year popup

              }}

            >

              Get Data

            </button>

          </div>

        )}

      </div>

      {/* Month/Year Selection Popup */}

      {showGetDataPopup && (

        <div

          className="position-fixed top-50 start-50 translate-middle bg-white p-4 rounded shadow"

          style={{ zIndex: 999, minWidth: '360px' }}

        >

          <h5 className="fw-bold mb-3 text-center">Select Month and Year</h5>

          <div className="mb-3 text-center">

            <DatePicker

              selected={selectedDate}

              onChange={(date) => setSelectedDate(date)}

              dateFormat="MM/yyyy"

              showMonthYearPicker

              showFullMonthYearPicker // Ensures only month/year are selectable

              maxDate={lastDayOfPreviousMonth} // <--- Restricts to past months

              className="form-control text-center" // Apply Bootstrap styling

              placeholderText="Select Month & Year"

            />

          </div>

          <button

            className="btn btn-primary w-100 mb-2"

            onClick={handleStartReconciliation}

            disabled={!selectedDate} // Disable button if no date is selected

          >

            Start Reconciliation

          </button>

          <button className="btn btn-outline-secondary w-100" onClick={() => setShowGetDataPopup(false)}>

            Cancel

          </button>

        </div>

      )}

    </div>

  );

};

export default UploadFiles;

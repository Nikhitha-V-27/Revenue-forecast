// import React from 'react';

// const UploadCard = ({
//   title,
//   description,
//   icon,
//   onUpload,
//   onRemove,
//   uploaded,
//   uploadedFileName,
//   disabled = false,
//   isReconciliationCard = false
// }) => (
//   <div className="col-12 col-md-4">
//     <div
//       className={`card h-100 shadow-sm border-0 text-center p-4 ${disabled ? 'opacity-75' : ''}`}
//       style={{ borderRadius: '0.75rem' }}
//     >
//       <div className="card-body d-flex flex-column align-items-center">
//         <div className="fs-1 mb-3">{icon}</div>
//         <h5 className="fw-semibold text-dark mb-2">{title}</h5>

//         {!isReconciliationCard && description && (
//           <p className="card-text text-muted small mb-4">{description}</p>
//         )}

//         {!isReconciliationCard ? (
//           <label
//             className={`btn text-white px-4 py-2 fw-semibold shadow-sm ${
//               uploaded || disabled ? 'disabled' : ''
//             }`}
//             style={{
//               background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
//               borderRadius: '50px',
//               border: 'none',
//               transition: 'all 0.2s ease-in-out',
//               cursor: uploaded || disabled ? 'not-allowed' : 'pointer'
//             }}
//           >
//             Choose File
//             <input
//               type="file"
//               className="d-none"
//               onChange={onUpload}
//               disabled={disabled || uploaded}
//             />
//           </label>
//         ) : (
//           <button
//             className="btn text-white px-4 py-2 fw-semibold shadow-sm"
//             onClick={onUpload}
//             disabled={disabled}
//             style={{
//               background: 'linear-gradient(90deg, #10b981, #059669)',
//               borderRadius: '50px',
//               border: 'none',
//               transition: 'all 0.2s ease-in-out',
//               cursor: disabled ? 'not-allowed' : 'pointer'
//             }}
//           >
//             Start
//           </button>
//         )}

//         {uploaded && uploadedFileName && !isReconciliationCard && (
//           <>
//             <p
//               className="text-success small mt-3 mb-1 text-wrap"
//               style={{ maxWidth: '100%', wordBreak: 'break-word' }}
//             >
//               Uploaded: {uploadedFileName}
//             </p>
//             <button
//               onClick={onRemove}
//               className="btn btn-sm mt-1 text-secondary border border-secondary bg-white"
//               style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
//             >
//               Remove
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   </div>
// );

// export default UploadCard;

// import React, { useRef } from 'react';

// const UploadCard = ({
//   title,
//   description,
//   icon,
//   onFileSelect,
//   onProcessUpload,
//   onRemove,
//   isSelected,
//   uploaded,
//   fileName
// }) => {
//   const fileInputRef = useRef(null);

//   // Handles clicking the main button on the card, which triggers the hidden file input
//   const handleChooseFileClick = () => {
//     // Only allow choosing if not already selected or uploaded
//     if (!isSelected && !uploaded) {
//       fileInputRef.current.click();
//     }
//   };

//   return (
//     <div className="col-12 col-md-6 col-lg-4 d-flex">
//       <div
//         className={`card flex-grow-1 p-4 rounded-3 shadow-sm d-flex flex-column justify-content-between ${
//           uploaded ? 'bg-light text-muted' : 'bg-white' // Visually indicate uploaded state
//         }`}
//       >
//         <div className="text-center mb-3">
//           <span style={{ fontSize: '2.5rem' }}>{icon}</span> {/* Display emoji icon */}
//         </div>
//         <h5 className="fw-bold text-center mb-2">{title}</h5>
//         <p className="text-muted text-center" style={{ fontSize: '0.9rem' }}>{description}</p>

//         <div className="mt-3 text-center">
//           {uploaded ? ( // State 3: File is fully uploaded/processed
//             <>
//               <p className="text-success mb-2">Uploaded: {fileName}</p>
//               <button className="btn btn-outline-danger btn-sm" onClick={onRemove}>
//                 Remove
//               </button>
//             </>
//           ) : isSelected ? ( // State 2: File is selected but not yet uploaded/processed
//             <>
//               <p className="text-info mb-2">Selected: {fileName}</p>
//               <div className="d-flex justify-content-center gap-2">
//                 <button className="btn btn-outline-danger btn-sm" onClick={onRemove}>
//                   Remove
//                 </button>
//                 {/* Upload button is enabled if selected and not yet uploaded */}
//                 <button className="btn btn-primary btn-sm" onClick={onProcessUpload}>
//                   Upload
//                 </button>
//               </div>
//             </>
//           ) : ( // State 1: No file selected yet
//             <>
//               <button
//                 className={`btn btn-outline-primary rounded-pill px-4`}
//                 onClick={handleChooseFileClick}
//                 // Choose File button is disabled if a file is already selected or uploaded
//                 disabled={isSelected || uploaded}
//               >
//                 Choose File
//               </button>
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={onFileSelect} // This handler is called when a file is chosen
//                 style={{ display: 'none' }}
//               />
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UploadCard;

import React, { useRef } from 'react';

const UploadCard = ({

  title,

  description,

  icon,

  onFileSelect, // Function to call when a file is selected (from hidden input)

  onProcessUpload, // Function to call when "Upload" is clicked

  onRemove, // Function to call when "Remove" is clicked

  isSelected, // Boolean: true if a file is selected (but not yet uploaded)

  uploaded, // Boolean: true if the file has been successfully uploaded

  fileName, // String: Name of the selected/uploaded file

  children, // Added to render loading spinner or other content

  disabled // NEW PROP: Boolean, true if this card should be disabled by parent

}) => {

  const fileInputRef = useRef(null);

  /**

   * Triggers the hidden file input click when the "Choose File" button is clicked.

   * This button should also be disabled if the card is globally disabled by the parent.

   */

  const handleChooseFileClick = () => {

    // Only allow opening file dialog if the card is not disabled and no file is selected/uploaded

    if (!disabled && !isSelected && !uploaded) {

      fileInputRef.current.click();

    }

  };

  return (

    <div className="col-12 col-md-6 col-lg-4 d-flex">

      <div

        className={`card flex-grow-1 p-4 rounded-3 shadow-sm d-flex flex-column justify-content-between ${disabled ? 'bg-light text-muted' : (uploaded ? 'bg-light text-muted' : 'bg-white') // Apply grey if disabled OR if already uploaded

          }`}

      >

        <div className="text-center mb-3">

          <span style={{ fontSize: '2.5rem' }}>{icon}</span> {/* Display emoji icon */}

        </div>

        <h5 className="fw-bold text-center mb-2">{title}</h5>

        <p className="text-muted text-center" style={{ fontSize: '0.9rem' }}>{description}</p>

        <div className="mt-3 text-center">

          {/* Render children (e.g., LoadingSpinner) if provided */}

          {children}

          {/* Only show buttons/status messages if no children (i.e., not loading) */}

          {!children && (

            uploaded ? ( // State 3: File is fully uploaded/processed

              <>

                <p className="text-success mb-2">Uploaded: {fileName}</p>

                <button

                  className="btn btn-outline-danger btn-sm"

                  onClick={onRemove}

                  disabled={disabled} // Disable remove button if card is globally disabled

                >

                  Remove

                </button>

              </>

            ) : isSelected ? ( // State 2: File is selected but not yet uploaded/processed

              <>

                <p className="text-info mb-2">Selected: {fileName}</p>

                <div className="d-flex justify-content-center gap-2">

                  <button

                    className="btn btn-outline-danger btn-sm"

                    onClick={onRemove}

                    disabled={disabled} // Disable remove button if card is globally disabled

                  >

                    Remove

                  </button>

                  <button

                    className="btn btn-primary btn-sm"

                    onClick={onProcessUpload}

                    disabled={disabled} // Disable upload button if card is globally disabled

                  >

                    Upload

                  </button>

                </div>

              </>

            ) : ( // State 1: No file selected yet

              <>

                <button

                  className={`btn btn-outline-primary rounded-pill px-4`}

                  onClick={handleChooseFileClick}

                  // Button is disabled if a file is already selected, uploaded, or if the card is globally disabled

                  disabled={isSelected || uploaded || disabled}

                >

                  Choose File

                </button>

                <input

                  type="file"

                  ref={fileInputRef}

                  onChange={onFileSelect} // This handler is called when a file is chosen

                  style={{ display: 'none' }} // Hide the native file input button

                />

              </>

            )

          )}

        </div>

      </div>

    </div>

  );

};

export default UploadCard;










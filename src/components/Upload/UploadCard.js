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
    // CHANGE THIS LINE: Removed 'col-lg-4' to force 2 columns on larger screens as well.
    // The 'col-md-6' ensures 2 cards per row on medium and large screens.
    <div className="col-12 col-md-6 d-flex"> 
      <div
        className={`card flex-grow-1 p-4 rounded-3 shadow-sm d-flex flex-column justify-content-between ${disabled ? 'bg-light text-muted' : (uploaded ? 'bg-light text-muted' : 'bg-white')
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
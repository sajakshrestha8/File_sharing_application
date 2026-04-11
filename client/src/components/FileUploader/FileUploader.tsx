import React, { useState, useRef } from "react";

interface FileUploaderProps {
  onShare: (file: File, setProgress: (p: number) => void) => Promise<void>;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onShare }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    const selectedFile = files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert("File size exceeds 50MB limit");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleStartShare = async () => {
    if (!file) return;
    setIsSending(true);
    try {
      await onShare(file, setUploadProgress);
    } catch (err) {
      setIsSending(false);
      setUploadProgress(0);
      console.log(err);
    }
  };

  const reset = () => {
    setFile(null);
    setIsSending(false);
    setUploadProgress(0);
  };

  if (!file) {
    return (
      <div
        className={`dropzone ${isDragging ? "dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: "100%",
          height: "260px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: `2px dashed ${isDragging ? "#d4a373" : "#e5d5c5"}`,
          borderRadius: "16px",
          backgroundColor: "#fffcf9",
          cursor: "pointer",
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: "none" }}
        />
        <div
          style={{
            backgroundColor: "#f9f0e6",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "16px",
          }}
        >
          📤
        </div>
        <h3>Drag & drop files here</h3>
        <p>
          or{" "}
          <span style={{ color: "#d4a373", fontWeight: "bold" }}>
            browse computer
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="upload-card">
      <div className="upload-card-header">
        <h3>Selected File</h3>
      </div>
      <div className="file-preview">
        <div className="file-preview-row">
          <div className="file-meta-block">
            <span className="file-name-text">{file.name}</span>
            <span className="file-size-text">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>
        </div>

        {isSending ? (
          <div className="progress-bar-wrap">
            <div className="progress-bar-label">
              <span>
                {uploadProgress === 100 ? "Finalizing..." : "Uploading..."}
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="progress-mini">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="upload-actions">
            <button className="btn-primary" onClick={handleStartShare}>
              Share File
            </button>
            <button className="btn-secondary" onClick={reset}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;

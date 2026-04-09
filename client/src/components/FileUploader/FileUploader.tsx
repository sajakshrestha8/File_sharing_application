import React, { useState, useRef, ChangeEvent, DragEvent } from "react";

interface FileUploaderProps {
  onFileSelect: (files: FileList) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (): void => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList): void => {
    onFileSelect(files);
  };

  const containerStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "800px",
    height: "240px",
    margin: "40px auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: `2px dashed ${isDragging ? "#d4a373" : "#e5d5c5"}`,
    borderRadius: "16px",
    backgroundColor: "#fffcf9",
    transition: "all 0.3s ease",
    cursor: "pointer",
    fontFamily: "system-ui, -apple-system, sans-serif",
  };

  const iconContainerStyle: React.CSSProperties = {
    backgroundColor: "#f9f0e6",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "16px",
  };

  return (
    <div
      style={containerStyle}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileInputChange}
        style={{ display: "none" }}
        aria-label="File upload"
      />

      <div style={iconContainerStyle}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8d5a2d"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>

      <h3 style={{ margin: "0 0 4px 0", color: "#333", fontSize: "1.25rem" }}>
        Drag & drop files here
      </h3>

      <p style={{ margin: "0", color: "#666", fontSize: "0.9rem" }}>
        or{" "}
        <span style={{ color: "#d4a373", fontWeight: "bold" }}>
          browse from your computer
        </span>
      </p>

      <p style={{ marginTop: "16px", color: "#999", fontSize: "0.8rem" }}>
        Supports all file types up to 500MB
      </p>
    </div>
  );
};

export default FileUploader;

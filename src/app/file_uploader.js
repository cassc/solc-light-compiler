'use client';

import React, { useCallback, useState } from 'react';

const FileUploader = ({ onFileSelect, label }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    onFileSelect(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      onFileSelect(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  return (
    <label
    className={`bg-indigo-500 text-white px-8 py-2 rounded cursor-pointer ${
        isDragOver ? 'bg-indigo-800 border border-white' : ''
      }`}
    onDrop={handleDrop}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    >
    { label }
    <input
      type="file"
      accept=".json"
      onChange={handleFileChange}
      style={{ display: 'none' }}
    />
    </label>
  );
};

export default FileUploader;

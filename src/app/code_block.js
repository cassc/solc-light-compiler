'use client'

import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, language, onChange, readOnly }) => {
  const options = {
    readOnly,
    selectOnLineNumbers: true,
    language: language,
  };

  return (
    <Editor
      defaultLanguage="sol"
      width="100%" // Adjust width as needed
      height="80vh"
      language={language}
      theme="vs-dark" // or "vs-light"
      value={code}
      options={options}
      onChange={onChange}
    />
  );
};

export default CodeEditor;

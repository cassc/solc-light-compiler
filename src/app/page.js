'use client'

import { useState } from 'react';
import CodeBlock from './code_block';
const _ = require('lodash');

function Home() {
  const [jsonData, setJsonData] = useState(null);
  const [title, setTitle] = useState(null);
  const [stdInputJson, setStdInputJson] = useState(null);
  const [activeContent, setActiveContent] = useState("");

  function viewFile(source){
    return () => {
      const content = stdInputJson?.sources[source]?.content || "";
      setActiveContent(content);
    }
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const title = data?.ContractName;
          let sourceCode = data?.SourceCode;
          sourceCode = sourceCode.replace(/^\{\{/, "{").replace(/}}$/, "}");
          const stdInputJson = JSON.parse(sourceCode);
          setJsonData(data);
          setTitle(title);
          setStdInputJson(stdInputJson);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Invalid JSON file");
          setTitle(null);
        }
      };
      reader.readAsText(file);
    }
  }

  return (
    <main className="min-h-screen min-w-screen relative">
    <div className="flex flex-col w-full gap-2">
    <div className="w-full p-2 border-indigo-500 border-b-2 flex flex-row gap-2 justify-between">
    <div className="p-2">{ title || "Please select a file" }</div>
    <div className="p-2">
    <label className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 cursor-pointer">
    Import
    <input type="file" accept=".json" onChange={handleFileChange}
    style={{ display: 'none' }}
    />
    </label>
    </div>
    </div>
    <div className="w-full grid grid-cols-10 gap-2">
      <div className="w-full col-span-2 p-2 bg-red-100">
        <h3 className="text-xl">File tree:</h3>
        { _.map(stdInputJson?.sources, (val, source) => (
          <div key={source} className="truncate hover:overflow-visible hover:z-0">
            <code className="cursor-pointer" onClick={viewFile(source)}> { source } </code>
          </div>
        ))
        }
      </div>
      <div className="w-full col-span-8 p-2 bg-green-100">
        <CodeBlock language="solidity" >
          {activeContent}
        </CodeBlock>
      </div>
    </div>
    <div className="absolute w-full p-2 border-white border-b-2 bottom-0 bg-black text-white">
      Footer
    </div>
    </div>
    </main>
  )
}


export default Home;

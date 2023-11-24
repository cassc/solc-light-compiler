'use client'

import { useState } from 'react';
import CodeBlock from './code_block';
const _ = require('lodash');

function Home() {
  const [jsonData, setJsonData] = useState(null);
  const [title, setTitle] = useState(null);
  const [stdInputJson, setStdInputJson] = useState(null);
  const [activeContent, setActiveContent] = useState("");
  const [output, setOutput] = useState(null);

  function viewFile(source){
    return () => {
      const content = stdInputJson?.sources[source]?.content || "";
      setActiveContent(content);
    }
  }

  function postMessageToWorker(worker, message) {
    return new Promise((resolve, reject) => {
      function handleMessage(e) {
        if (e.data.type === 'loaded' || e.data.type === 'compiled') {
          worker.removeEventListener('message', handleMessage);
          resolve(e.data);
        } else if (e.data.type === 'error') {
          worker.removeEventListener('message', handleMessage);
          reject(new Error(e.data.error));
        }
      }

      worker.addEventListener('message', handleMessage);
      worker.postMessage(message);
    });
  }


  async function handleCompile(_event) {
    if (!stdInputJson || !jsonData?.CompilerVersion) {
      console.error('Standard input JSON is not available');
      return;
    }

    const worker = new Worker('worker.bundle.js');

    try {
      // Load the compiler
      await postMessageToWorker(worker, {
        command: 'loadCompiler',
        version: jsonData.CompilerVersion
      });

      // Compile the standard input JSON
      const compileOutput = await postMessageToWorker(worker, {
        command: 'compile',
        input: stdInputJson
      });

      // Handle the compilation output
      console.log('Compilation output:', compileOutput);
      if (compileOutput?.type === 'compiled') {
        console.log('Compilation successful:', compileOutput.output);
        setActiveContent(compileOutput.output);
        const output = JSON.parse(compileOutput.compiled);
      } else {
        console.error('Compilation error:', compileOutput?.error || "unknown error");
      }
    } catch (error) {
      // Handle any errors
      console.error('Compilation error:', error);
    } finally {
      // Terminate the worker when done
      worker.terminate();
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
          <div className="p-2">
            <span className="font-bold">
              { title || "Please select a file" }
            </span>
            {
              jsonData?.CompilerVersion && (
                <span className="mx-3">
                  🛠️ { jsonData?.CompilerVersion || "" }
                </span>
              )
            }
            {
              jsonData?.Runs && (
                <span className={`mx-3 ${jsonData?.OptimizationUsed === "0" ? "text-gray-500" : "text-black"}`}>
                  🏃‍♂️️ { jsonData?.Runs || "" }
                </span>
              )
            }
          </div>
          <div className="p-2">
            <label className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 cursor-pointer">
              Import
              <input type="file" accept=".json" onChange={handleFileChange}
                     style={{ display: 'none' }}
              />
            </label>
            { jsonData && (
                <label className="ml-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 cursor-pointer" onClick={handleCompile}>
                  Compile
                </label>)
            }
          </div>
        </div>
        <div className="w-full grid grid-cols-10 gap-2">
          <div className="w-full col-span-2 p-2 bg-blue-50 hover:z-0">
            <h3 className="text-xl hover:z-0 hover:overflow-visible">File tree:</h3>
            { _.map(stdInputJson?.sources, (val, source) => (
              <div key={source}>
                <code className="hover:p-1 truncate hover:z-0 hover:overflow-visible hover:bg-white cursor-pointer" onClick={viewFile(source)}> { source } </code>
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

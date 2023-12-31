'use client'

import { useState } from 'react';
import LeftPanel from './left';
import {  parseAsStdJson, parseAsWrappedJson } from '../utils';
import {  availableVersions } from '../versions';
import FileUploader from './file_uploader';
const _ = require('lodash');

function Home() {
  const [jsonData, setJsonData] = useState(null);
  const [title, setTitle] = useState(null);
  const [stdInputJson, setStdInputJson] = useState(null);
  const [activeContent, setActiveContent] = useState("");
  const [activeLanguage, setActiveLanguage] = useState(null);
  const [output, setOutput] = useState(null);
  const [compiling, setCompiling] = useState(false);
  const [isWrappedJson, setIsWrappedJson] = useState(false);
  const [compilerVersion, setCompilerVersion] = useState(null);
  const [prettyInput, setPrettyInput] = useState(null);

  function viewFile(source){
    return () => {
      const content = stdInputJson?.sources[source]?.content || "";
      const language = source.split('.').pop();
      setActiveContent(content);
      setActiveLanguage(language);
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
    if (!stdInputJson) {
      console.error('Standard input JSON is not available');
      return;
    }

    if (!compilerVersion){
      console.error('Compiler version is not available');
      return;
    }

    const worker = new Worker('worker.bundle.js');
    let compileOutput = null;

    try {
      setCompiling(true);
      setOutput(null);
      // Load the compiler
      await postMessageToWorker(worker, {
        command: 'loadCompiler',
        version: compilerVersion
      });

      // Compile the standard input JSON
      compileOutput = await postMessageToWorker(worker, {
        command: 'compile',
        input: stdInputJson
      });

      // Handle the compilation output
      console.log('Compilation output:', compileOutput);
      if (compileOutput?.type === 'compiled') {
        console.log('Compilation successful:', compileOutput.output);
        const output = compileOutput.output && JSON.stringify(JSON.parse(compileOutput.output), null, 2);
        setOutput(output);
        setActiveContent(output || "Missing output!");
        setActiveLanguage("json");
      } else {
        console.error('Compilation error:', compileOutput?.error || "unknown error");
      }
    } catch (error) {
      // Handle any errors
      console.error('Compilation error:', error);
    } finally {
      setCompiling(false);
      // Terminate the worker when done
      worker.terminate();
    }

    // const output = compileOutput && JSON.parse(compileOutput.compiled);
  }


  async function handleFileChange(file) {
    if (file) {
      {
        setCompilerVersion(null);
        setOutput(null);
        setStdInputJson(null);
        let {success, stdInputJson, title, data, prettyInput } = await parseAsWrappedJson(file);
        if (success){
          setJsonData(data);
          setTitle(title);
          setCompilerVersion(data?.CompilerVersion);
          setStdInputJson(stdInputJson);
          setActiveContent(prettyInput);
          setActiveLanguage("json");
          setPrettyInput(prettyInput);
          setIsWrappedJson(true);
          return;
        }
      }

      {
        let {success, stdInputJson, prettyInput } = await parseAsStdJson(file);
        if (success){
          setIsWrappedJson(false);
          setJsonData(stdInputJson);
          setStdInputJson(stdInputJson);
          setActiveContent(prettyInput);
          setPrettyInput(prettyInput);
          setActiveLanguage("json");
          setCompilerVersion(null);
          return;
        }
      }
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
            <span className="mx-3">
              🛠️
              <select name="compilerVersion" id="compilerVersion"
                      onChange={(e)=>setCompilerVersion(e.target.value)} value={compilerVersion || ""}>
                <option value="">Please select</option>
                {availableVersions.map(version => (<option key={version} value={version}> {version} </option>))}
              </select>
            </span>
            {
              jsonData?.Runs && (
                <span className={`mx-3 ${jsonData?.OptimizationUsed === "0" ? "text-gray-500" : "text-black"}`}>
                  🏃‍♂️️ { jsonData?.Runs || "" }
                </span>
              )
            }
          </div>
          <div className="p-2">
            <FileUploader onFileSelect={handleFileChange} label="Import"/>
            { jsonData && (
              <label
                className={`ml-2 px-4 py-2 rounded cursor-pointer ${
    compilerVersion ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-gray-500 text-gray-300 cursor-not-allowed'
  }`}
                onClick={compilerVersion ? handleCompile : null}
              >
                {compiling ? (
                  <span className="animate-pulse">Compiling ...</span>
                ) : (
                  <span>Compile</span>
                )}
              </label>)
            }
          </div>
        </div>
        <LeftPanel
          isWrappedJson={isWrappedJson}
          prettyInput={prettyInput}
          stdInputJson={stdInputJson}
          viewFile={viewFile}
          compilationOutputString ={output}
          activeContent={activeContent}
          activeLanguage={activeLanguage}
          setActiveContent={setActiveContent}
          setActiveLanguage={setActiveLanguage}
        />
        {/* <div className="absolute w-full p-2 border-white border-b-2 bottom-0 bg-black text-white"> */}
        {/*   Footer */}
        {/* </div> */}
      </div>
    </main>
  )
}


export default Home;

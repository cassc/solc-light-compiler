'use client'

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import MainPanel from './main';
import {  parseAsStdJson, parseAsWrappedJson } from '../utils';
import {  availableVersions } from '../versions';

import FileUploader from './file_uploader';
const lodash = require('lodash');
import { useAtom } from 'jotai'
import  * as store from '../model/store';

function Home() {
  const [jsonData, setJsonData] = useAtom(store.inputJsonAtom);
  const [title, setTitle] = useAtom(store.titleAtom);
  const [stdInputJson, setStdInputJson] = useAtom(store.standardInputJsonAtom);
  const [activeContent, setActiveContent] = useAtom(store.activeContentAtom);
  const [activeLanguage, setActiveLanguage] = useAtom(store.activeLanguageAtom);
  const [output, setOutput] = useAtom(store.compilationOutputAtom);
  const [compiling, setCompiling] = useAtom(store.isCompilingAtom);
  const [isWrappedJson, setIsWrappedJson] = useAtom(store.isWrappedJsonAtom);
  const [compilerVersion, setCompilerVersion] = useAtom(store.compilerVersionAtom);
  const [prettyInput, setPrettyInput] = useAtom(store.prettyInputAtom);
  const [activeContentReadOnly, setActiveContentReadOnly] = useAtom(store.activeContentReadOnlyAtom);
  const [activeContentPath, setActiveContentPath] = useAtom(store.activeContentPathAtom);
  const [sources, setSources] = useAtom(store.sourcesAtom);
  const [internalChange, setInternalChange] = useAtom(store.internalChangeAtom);

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

  async function handleDownload(_){
    const zip = new JSZip();
    const sourceCode =  stdInputJson?.SourceCode; // flattened single file source code

    const root = title ? `${title}/` : "";

    if (sourceCode) {
      zip.file(`${root}${title || "source"}.sol`, sourceCode);
    }

    if (sources) {
      lodash.forEach(sources, ({content}, path) => {
        zip.file(`${root}${path}`, content);
      });
    }

    try {
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${title || "sources"}.zip`);
    } catch (error) {
      alert(`Error creating ZIP file: ${error}`);
    }
  }

  async function handleFileChange(file) {
    try{
      setInternalChange(true);
      if (file) {
        { // json as string (might not be standard input json) and wrapped inside another input json
          setCompilerVersion(null);
          setOutput(null);
          setStdInputJson({sources: {}});
          let {success, stdInputJson, title, data, prettyInput } = await parseAsWrappedJson(file);
          if (success){
            setJsonData(data);
            setTitle(title);
            setCompilerVersion(data?.CompilerVersion);
            setStdInputJson(stdInputJson);
            setActiveContent(prettyInput);
            setActiveLanguage("json");
            setPrettyInput(prettyInput);
            setActiveContentReadOnly(true);
            setIsWrappedJson(true);
            return;
          }
        }

        { // Standard json
          let {success, stdInputJson, prettyInput } = await parseAsStdJson(file);
          if (success){
            setIsWrappedJson(false);
            setJsonData(stdInputJson);
            setStdInputJson(stdInputJson);
            setActiveContent(prettyInput);
            setPrettyInput(prettyInput);
            setActiveLanguage("json");
            setActiveContentReadOnly(true);
            setCompilerVersion(stdInputJson?.CompilerVersion);
            return;
          }
        }
      }
    }finally{
      setInternalChange(false);
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
            { (!lodash.isEmpty(jsonData) || !lodash.isEmpty(stdInputJson)) && (
                <label
                  className={`ml-2 px-4 py-2 rounded cursor-pointer ${
    compilerVersion ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-gray-500 text-gray-300 cursor-not-allowed'
  }`}
                  onClick={handleDownload} > Download </label>)
            }
            { compilerVersion && !lodash.isEmpty(stdInputJson) && (
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
        <MainPanel />
        {/* <div className="absolute w-full p-2 border-white border-b-2 bottom-0 bg-black text-white"> */}
          {/*   Footer */}
          {/* </div> */}
      </div>
    </main>
  )
}


export default Home;

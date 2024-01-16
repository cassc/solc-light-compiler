'use client'

import CodeBlock from './code_block';
const _ = require('lodash');
import { useAtom } from 'jotai'
import  * as store from '../model/store';


const MainPanel = ({  }) => {
  // compilationOutput, standardInputJson, viewFile, activeContent, setActiveContent, prettyInput, isWrappedJson, setActiveLanguage

  const [compilationOutput, setCompilationOutput] = useAtom(store.compilationOutputAtom);
  const [standardInputJson, setStandardInputJson] = useAtom(store.standardInputJsonAtom);
  const [activeContent, setActiveContent] = useAtom(store.activeContentAtom);
  const [activeLanguage, setActiveLanguage] = useAtom(store.activeLanguageAtom);
  const [prettyInput, setPrettyInput] = useAtom(store.prettyInputAtom);
  const [isWrappedJson, setIsWrappedJson] = useAtom(store.isWrappedJsonAtom);
  const [activeContentPath, setActiveContentPath] = useAtom(store.activeContentPathAtom);
  const [activeContentReadOnly, setActiveContentReadOnly] = useAtom(store.activeContentReadOnlyAtom);

  function maybeSaveChanges(content){
    // todo
  }

  function setActiveView({content, language, readOnly, path}){
    setActiveContent(content);
    setActiveLanguage(language);
    setActiveContentReadOnly(readOnly);
    setActiveContentPath(path);
  }

  function viewFile(source){
    return () => {
      const content = standardInputJson?.sources[source]?.content || "";
      const language = source.split('.').pop();
      setActiveView({content, language, readOnly: false, path: ['sources', source, 'content']});
    }
  }

  function viewFlattenSourceCode(_){
    setActiveView({ content: standardInputJson.SourceCode, language: "sol", readOnly: false, path: ["SourceCode"] });
  }

  function viewPrettyInput(_){
    setActiveView({content: prettyInput, language: "json", readOnly: true, path: "prettyInput"});
  }

  function viewStandardInputJson(_){
    setActiveView({content: JSON.stringify(standardInputJson, null, 2), language: "json", readOnly: false, path: "standardInputJson"});
  }

  function viewCompilationOutput(_){
    setActiveView({content: compilationOutput, language: "json", readOnly: true, path: "compilationOutput"});
  }

  return (
    <div className="w-full grid grid-cols-10 gap-2">
      <div className="w-full col-span-2 p-2 bg-blue-50">
        <h3 className="text-xl">File tree:</h3>
        { _.map(standardInputJson?.sources, (_, source) => (
        <div className="hover:p-1 truncate truncate-left hover:bg-white cursor-pointer" key={source} title={source}>
          <code onClick={viewFile(source)}> { source } </code>
        </div>))
    }
    {
      standardInputJson?.SourceCode && (
        <div className="w-full mt-4">
          <label className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 cursor-pointer" onClick={viewFlattenSourceCode}>
            Source Code
          </label>
        </div>)
    }
    {
      prettyInput && (
        <div className="w-full mt-4">
          <label className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 cursor-pointer" onClick={viewPrettyInput}>
            Input JSON
          </label>
        </div>)
    }
    {
      standardInputJson?.sources  && (
        <div className="w-full mt-4">
          <label className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 cursor-pointer" onClick={viewStandardInputJson}>
            Standard Input JSON
          </label>
        </div>)
    }
    {
      compilationOutput && (
        <div className="w-full mt-4">
          <label className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 cursor-pointer" onClick={viewCompilationOutput}>
            Compilation Output JSON
          </label>
        </div>)
    }
    </div>
    <div className="w-full col-span-8 p-2 bg-green-100">
      <CodeBlock language="solidity" code={activeContent} readOnly={activeContentReadOnly} onChange={maybeSaveChanges} />
    </div>
    </div>
  );
}

export default MainPanel;

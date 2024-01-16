'use client'

import CodeBlock from './code_block';
const _ = require('lodash');

const MainPanel = ({ compilationOutputString, stdInputJson, viewFile, activeContent, setActiveContent, prettyInput, isWrappedJson, setActiveLanguage }) => {

  function setActiveContentWithLanguage(content, language){
    setActiveContent(content);
    setActiveLanguage(language);
  }

  return (
    <div className="w-full grid grid-cols-10 gap-2">
    <div className="w-full col-span-2 p-2 bg-blue-50">
    <h3 className="text-xl">File tree:</h3>
    { _.map(stdInputJson?.sources, (_, source) => (
    <div className="hover:p-1 truncate truncate-left hover:bg-white cursor-pointer" key={source} title={source}>
      <code onClick={viewFile(source)}> { source } </code>
    </div>))
    }
    {
      stdInputJson?.SourceCode && (
        <div className="w-full mt-4">
          <label className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 cursor-pointer" onClick={(_) => setActiveContentWithLanguage(stdInputJson.SourceCode, "sol")}>
            Source Code
          </label>
        </div>)
    }
    {
      prettyInput && (
        <div className="w-full mt-4">
          <label className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 cursor-pointer" onClick={(_) => setActiveContentWithLanguage(prettyInput, "json")}>
            Input JSON
          </label>
        </div>)
    }
    {
      stdInputJson?.sources  && (
        <div className="w-full mt-4">
          <label className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 cursor-pointer" onClick={(_) => setActiveContentWithLanguage(JSON.stringify(stdInputJson, null, 2), "json")}>
            Standard Input JSON
          </label>
        </div>)
    }
    {
      compilationOutputString && (
        <div className="w-full mt-4">
          <label className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 cursor-pointer" onClick={(_) => setActiveContentWithLanguage(compilationOutputString, "json")}>
            Compilation Output JSON
          </label>
        </div>)
    }
    </div>
    <div className="w-full col-span-8 p-2 bg-green-100">
      <CodeBlock language="solidity" code={activeContent} />
    </div>
    </div>
  );
}

export default MainPanel;

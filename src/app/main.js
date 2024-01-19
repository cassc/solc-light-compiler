'use client'

import CodeBlock from './code_block';
const _ = require('lodash');
import { useAtom } from 'jotai'
import  * as store from '../model/store';
import {  availableVersions } from '../versions';
import { resolveNpmImport } from '@/utils';
const parser = require('@solidity-parser/parser')

const parserOption = {tolerant: true, loc: true, range: true};

const templateStdJson = {
  language: "Solidity",
  settings: {
    outputSelection : {
      '*': {
        '*': [ '*' ]
      }
    }
  },
};

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
  const [compilerVersion, setCompilerVersion] = useAtom(store.compilerVersionAtom);
  const [sources, setSources] = useAtom(store.sourcesAtom);
  const [internalChange, setInternalChange] = useAtom(store.internalChangeAtom);


  async function reloadContext(content, sources, siblingUri=null){
    const astJson = parser.parse(content, parserOption);
    if (astJson){
      // parsing pragma version
      let pragmaDirective = _.find(astJson.children, { type: 'PragmaDirective' });
      let pragmaVersion = pragmaDirective ? pragmaDirective.value : null;
      if (pragmaVersion){
        console.log(`pragmaVersion: ${pragmaVersion}`);
        const isExact = pragmaVersion[0]<='9' && pragmaVersion[0]>='0';
        const [major, minor, patch] = pragmaVersion.substring(isExact ? 0 : 1).split('.').map(Number);
        console.log(`isExact: ${isExact} major: ${major}, minor: ${minor}, patch: ${patch}`)
        let foundVersion = availableVersions.find(longVersion => {
          const version = longVersion.split('+')[0].substring(1);
          const [vMajor, vMinor, vPatch] = version.split('.').map(Number);
          return (
            vMajor == major &&
            vMinor == minor &&
            vPatch >= patch
          );
        });
        if (foundVersion){
          setCompilerVersion(foundVersion);
        }
      }

      // parsing imports
      let importURIs = _.filter(astJson?.children, child => _.has(child, 'path'))
                        .map(child => child.path);
      importURIs = [...importURIs];

      if (importURIs.length > 0){
        console.log(`importURIs: ${importURIs}`);
        for (const uri of importURIs){
          if (_.has(sources, uri)){
            continue;
          }
          const resp = await resolveNpmImport(uri, siblingUri); // resp: {uri, content}
          if (resp){
            let {uri, content} = resp;
            console.log(`assigning ${uri} to sources`);
            sources = _.assign({}, sources, {[uri]: {content}});
            sources = await reloadContext(content, sources, uri);
          }
        }
      }
      setSources(sources);
    }
    return sources;
  }

  function maybeSaveChanges(content){
    if (internalChange){
      return;
    }
    console.log(`Saving ${content.substring(0, 10)}... to ${activeContentPath}`)
    if (activeContentPath == 'standardInputJson'){
      setStandardInputJson(JSON.parse(content));
      return ;
    }
    if (activeContentPath && activeContentPath[0] == 'sources'){
      standardInputJson.sources[activeContentPath[1]].content = content;
      setStandardInputJson(standardInputJson);
      reloadContext(content, sources);
      return ;
    }
    if (activeContentPath == ["SourceCode"]){
      setStandardInputJson({...standardInputJson, SourceCode: content});
      reloadContext(content, sources);
      return ;
    }
    if (!activeContentPath || _.isEmpty(activeContentPath)) {
      console.log('building a new std input json');
      let sourcesMap = _.assign({}, sources, {"source.sol": {content}});
      setStandardInputJson({...templateStdJson, sources: sourcesMap});
      setSources(sourcesMap);
      setActiveContentPath(['sources', 'source.sol', 'content']);
      setCompilerVersion(availableVersions[0]);
      reloadContext(content, sourcesMap);
      return ;
    }
  }

  function setActiveView({content, language, readOnly, path}){
    setInternalChange(true);
    try{
      setActiveLanguage(language);
      setActiveContentReadOnly(readOnly);
      setActiveContentPath(path);
      setActiveContent(content);
    }finally{
    }
    setInternalChange(false);
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
      { _.map(sources, (k, source) => (
        <div className={`truncate truncate-left hover:underline cursor-pointer ${_.includes(activeContentPath, source) ? "bg-white p-1" : ""}`} key={source} title={source}>
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
      !_.isEmpty(sources)  && (
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

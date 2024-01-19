
const axios = require('axios');
const path = require('path');

const readFile = async(file)=>{
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
}

const parseAsWrappedJson = async (file) => {
  try {
    const fileContent = await readFile(file);
    const data = JSON.parse(fileContent);
    const title = data?.ContractName;
    let sourceCode = data?.SourceCode;
    let sourceCodeJson ;
    let stdInputJson;
    try{
      sourceCodeJson = JSON.parse(sourceCode);
    } catch (error) {
      sourceCode = sourceCode?.replace(/^\{\{/, "{").replace(/}}$/, "}");
      sourceCodeJson = JSON.parse(sourceCode);
    }

    if (sourceCodeJson?.sources){
      stdInputJson = sourceCodeJson;
    } else {
      stdInputJson = {sources: sourceCodeJson};
    }

    const prettyInput = JSON.stringify(data, null, 2);
    return { stdInputJson, title, data, prettyInput, success: true };
  } catch (error) {
    console.error("Error parsing as wrapped JSON:", error);
    return { success: false, error };
  }
}


const parseAsStdJson = async (file) => {
  try {
    const fileContent = await readFile(file);
    const data = JSON.parse(fileContent);
    const isStdJson = data?.sources && data?.language;
    let stdInputJson = data;
    if (!isStdJson){
      stdInputJson = {
        sources: {"source.sol": {content: data.SourceCode || ""}},
        language: "Solidity",
        settings: {
          outputSelection : {
            '*': {
              '*': [ '*' ]
            }
          }
        }
      };
    }
    const prettyInput = JSON.stringify(data, null, 2);

    return { data, stdInputJson, prettyInput, success: true };
  } catch (error) {
    console.error("Error parsing std input JSON:", error);
    return { success: false, error };
  }
}

// ref libs/remix-url-resolver/src/resolve.ts
const resolveNpmImport = async (uri, siblingUri=null)=> {
  // convert  "@openzeppelin/contracts/utils/math/Math.sol";
  // =>
  // https://unpkg.com/@openzeppelin/contracts/utils/math/Math.sol or
  // https://cdn.jsdelivr.net/npm/@openzeppelin/contracts/utils/math/Math.sol

  // "@openzeppelin/contacts@5.0.1/token/ERC20/ERC20.sol";
  // =>
  // https://cdn.jsdelivr.net/npm/@openzeppelin/contacts@5.0.1/token/ERC20/ERC20.sol
  // https://unpkg.com/@openzeppelin/contacts@5.0.1/token/ERC20/ERC20.sol

  console.log(`resolving ${uri}`);

  if (uri.includes("://")){
    return "";
  }

  // Download from npm repo and return text content
  for (const npm_prefix of ["https://cdn.jsdelivr.net/npm/", "https://unpkg.com/"]){
    try{
      if (siblingUri){
        uri = siblingUri.substring(0, siblingUri.lastIndexOf("/")) + "/" + uri;
        uri = path.normalize(uri);
      }
      let url = npm_prefix + uri;
      const response = await axios.get(url);
      if (response.status === 200){
        console.log(`resolving ${uri} by ${url} success`);
        return {uri, content: response.data};
      }
      break;
    }catch (err){
      console.error(err);
    }
  }
};


export {
  parseAsStdJson,
  parseAsWrappedJson,
  resolveNpmImport
}

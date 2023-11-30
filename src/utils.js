
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
    sourceCode = sourceCode?.replace(/^\{\{/, "{").replace(/}}$/, "}");
    const stdInputJson = JSON.parse(sourceCode);
    const prettyInput = JSON.stringify(data, null, 2);
    return { stdInputJson, title, data, prettyInput, success: true };
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return { success: false, error };
  }
}


const parseAsStdJson = async (file) => {
  try {
    const fileContent = await readFile(file);
    const stdInputJson = JSON.parse(fileContent);
    const prettyInput = JSON.stringify(stdInputJson, null, 2);
    return { stdInputJson, prettyInput, success: true };
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return { success: false, error };
  }
}

export {
  parseAsStdJson,
  parseAsWrappedJson
}

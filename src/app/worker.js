import wrapper from 'solc/wrapper';

let compiler = null;

self.addEventListener('message', () => {
	const compiler = wrapper(self.Module)
	self.postMessage({
	  version: compiler.version()
	})
}, false)


self.addEventListener('message', (e) => {
  const data = e.data;

    // Load the specified version of solc
  if (data.command === 'loadCompiler') {
    const version = data.version;
    const url = `https://binaries.soliditylang.org/bin/soljson-${version}.js`;
    try{
      importScripts(url);
      compiler = wrapper(self.Module);
      console.log("compiler", compiler);
    }catch(error){
      console.error("Error in importing script or initializing compiler:", error, "from url:", url);
    }
    self.postMessage({
      type: 'loaded',
    });
  }

  if (!compiler) {
    self.postMessage({
      type: 'error',
      error: 'Compiler not loaded.'
    });
    return;
  }

  // Compile standard input json
  if (data.command === 'compile') {
    const input = data.input;
    try {
      // Assume 'compiler' is the loaded Solidity compiler instance
      const output = compiler.compile(JSON.stringify(input));

      // Post the compilation results back to the main thread
      self.postMessage({
        type: 'compiled',
        output: output
      });
    } catch (error) {
      // Handle any compilation errors
      self.postMessage({
        type: 'error',
        error: error.message || 'Unknown error during compilation.'
      });
    }
  }
});

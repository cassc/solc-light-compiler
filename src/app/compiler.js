import React, { useEffect, useState } from 'react';

const SolidityCompiler = () => {
    const [version, setVersion] = useState('');

    useEffect(() => {
      const worker = new Worker('dist/worker.bundle.js');
      worker.addEventListener('message', function (e) {
        setVersion(e.data.version);
        }, false);

        worker.postMessage({});

        return () => worker.terminate();
    }, []);

    return (
        <div>
            Solidity Compiler Version: {version}
        </div>
    );
};

export default SolidityCompiler;

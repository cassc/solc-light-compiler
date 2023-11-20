import React, { useEffect, useRef } from 'react';
import 'highlight.js/styles/default.css';  // Or another theme of your choice

const hljs = require('highlight.js');
const hljsDefineSolidity = require('highlightjs-solidity');
hljsDefineSolidity(hljs);

const CodeBlock = ({ language, children }) => {
    const codeRef = useRef(null);

    useEffect(() => {
      if (codeRef.current) {
        codeRef.current.removeAttribute('data-highlighted');
        hljs.highlightElement(codeRef.current);
      }
    }, [children]); // Dependency array includes 'children' to re-highlight when content changes

    return (
        <pre>
            <code ref={codeRef} className={`language-${language}`}>
                {children}
            </code>
        </pre>
    );
};

export default CodeBlock;

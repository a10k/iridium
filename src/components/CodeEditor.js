import { html } from 'htm/preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { CodeJar } from 'codejar';
import Prism from 'prismjs';

const CodeEditor = (props) => {
  const ref = useRef(null);
  const [code, _code] = useState(props.code);
  const [jar, _jar] = useState(null);

  useEffect(() => {
    if (ref && ref.current) {
      const cj = CodeJar(ref.current, (c) => {
        return Prism.highlightElement(c);
      });

      cj.updateCode(code);
      cj.onUpdate((code) => {
        _code(code);
      });

      _jar(cj);
    }
    return () => {
      jar && jar.destroy();
    };
  }, []);

  useEffect(() => {
    if (props.onUpdate) {
      props.onUpdate(code);
    }
  }, [code]);

  return html`<div class="EditorWrapper" tabindex=${props.index + ''}>
    <div
      ref=${ref}
      class="CodeEditor editor language-js"
      onKeyDown=${props.onKeypress}
    ></div>
  </div> `;
};

export default CodeEditor;

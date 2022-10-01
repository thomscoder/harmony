import MonacoEditor, { EditorDidMount } from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { MonacoServices } from 'monaco-languageclient';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { Fragment, useState } from 'react';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

const MONACO_OPTIONS: monaco.editor.IEditorConstructionOptions = {
  autoIndent: 'full',
  automaticLayout: true,
  contextmenu: true,
  fontFamily: 'monospace',
  fontSize: 13,
  lineHeight: 24,
  hideCursorInOverviewRuler: true,
  matchBrackets: 'always',
  minimap: {
    enabled: false,
  },
  readOnly: false,
  scrollbar: {
    horizontalSliderSize: 4,
    verticalSliderSize: 18,
  },
};

export function Editor({ text, save, close, filename }: { text: string; save: any; close: any; filename: string }) {
  const [writtenText, setWrittenText] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);
  const [fileExt, setFileExt] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloader, setDownloader] = useState<boolean>(false);
  const [editorUri, setEditorUri] = useState<monaco.Uri>();

  const textSaver = (e: any) => {
    e.preventDefault();
    save(writtenText);
    setSaved(true);
  };

  const editorDidMount: EditorDidMount = (editor) => {
    MonacoServices.install(monaco as any);
    if (editor && editor.getModel()) {
      const editorModel = editor.getModel();
      setEditorUri(editorModel?.uri);
      if (editorModel) {
        editorModel.setValue(text);
      }
    }
    const pattern = /\w+(?![\.\w])/;
    const lang = filename.match(pattern)![0];
    switch (lang) {
      case 'js':
        setFileExt('javascript');
        break;
      case 'ts':
        setFileExt('typescript');
        break;
      default:
        setFileExt(lang);
        break;
    }
    editor.focus();
  };

  const onChange = (newCode: string, event: monaco.editor.IModelContentChangedEvent) => {
    setWrittenText(newCode);
    setSaved(false);
    setCopied(false);
    setDownloader(false);
  };

  const download = (text: string, name: string, type: string) => {
    var a = document.getElementById('downloader') as any;
    var file = new Blob([text], { type: type });
    a.href = URL.createObjectURL(file);
    a.download = name;
  };

  return (
    <Fragment>
      <form onSubmit={textSaver}>
        <h3>
          {saved ? <span className="saved-message">Saved</span> : copied ? <span className="saved-message">Copied</span> : 'Editing'} {filename}
        </h3>
        <MonacoEditor width="80%" height="40vh" language={fileExt} theme="vs-dark" options={MONACO_OPTIONS} onChange={onChange} editorDidMount={editorDidMount} />
        <div className="editor-btn-container">
          <button
            type="button"
            className="editor-btn copy-btn"
            onClick={() => {
              navigator.clipboard.writeText(writtenText).then(() => {
                setCopied(true);
              });
            }}
          >
            Copy Text
          </button>
          <button type="submit" className="editor-btn save-btn">
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              const editorModel = monaco.editor.getModel(editorUri as monaco.Uri);
              editorModel?.setValue('');
            }}
          >
            Clear
          </button>
          <a
            href=""
            id="downloader"
            style={{
              display: !downloader ? 'none' : 'inline-block',
            }}
          >
            Download
          </a>
          {!downloader && (
            <button
              type="button"
              onClick={() => {
                download(writtenText, filename, 'text/plain');
                setDownloader(true);
              }}
            >
              Prepare download
            </button>
          )}
          <button type="button" className="editor-btn close-btn" onClick={() => close()}>
            Close
          </button>
        </div>
      </form>
    </Fragment>
  );
}

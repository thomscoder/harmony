import MonacoEditor, { EditorDidMount } from "react-monaco-editor";
import * as monaco from 'monaco-editor';
import { MonacoServices } from "monaco-languageclient";

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

const MONACO_OPTIONS: monaco.editor.IEditorConstructionOptions = {
    autoIndent: "full",
    automaticLayout: true,
    contextmenu: true,
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 24,
    hideCursorInOverviewRuler: true,
    matchBrackets: "always",
    minimap: {
        enabled: false,
    },
    readOnly: false,
    scrollbar: {
        horizontalSliderSize: 4,
        verticalSliderSize: 18,
    },
};



export function Editor({text}: {text: string}) {
    const editorDidMount: EditorDidMount = (editor) => {
        MonacoServices.install(monaco as any);
        if (editor && editor.getModel()) {
            const editorModel = editor.getModel();
            if (editorModel) {
                editorModel.setValue(text);
            }
        }
        editor.focus();
    };

    const onChange = (newCode: string, event: monaco.editor.IModelContentChangedEvent) => {
        console.log('onChange', newCode);
    };

    return (

        <MonacoEditor
            width="100%"
            height="80vh"
            language="txt"
            theme="vs"
            options={MONACO_OPTIONS}
            onChange={onChange}
            editorDidMount={editorDidMount}
        />
    );
}
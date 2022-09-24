import { Fragment, useEffect, useState } from 'react'
import './App.css'
import {initWasm, startGo} from '../actions/wasmReader'
import { Editor } from './components/Editor';
import fileImage from './img/file.png'

initWasm();

function App() {
  const [file, setFile] = useState<File>();
  const [ fileContent, setFileContent ] = useState<any>();
  const [virtualFiles, setVirtualFiles] = useState([]);
  const [ showEditor, setShowEditor ] = useState<boolean>(false);
  const [editorContent, setEditorContent] = useState<string>('');
  const [virtualFileCreation, setVirtualFileCreation] = useState<string>('');
  const [ fileCreatorChecked, setFileCreatorChecked ] = useState<boolean>(false);

  const fileCreator = () => {
    setFileCreatorChecked(prev => !prev);
  }

  const startGoWrapper = (filename: string, content: string = `Created at: ${new Date().toLocaleString()}`) => {
    return startGo(JSON.stringify({
        files: [{
          name: filename,
          content: content
        }]
      }));
  }

  useEffect(() =>{
    const fileSelector = document.getElementById('file-selector') as HTMLInputElement;
    fileSelector.addEventListener('change', (event) => {
      if (showEditor) setShowEditor(false);
      // @ts-ignore
      const fileList = event?.target!.files;
      setFile(fileList[0]);
    });
  }, []);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt: ProgressEvent<FileReader>) => {
        setFileContent(evt?.target!.result);
      };
      reader.readAsText(file);
    }
  }, [file]);

  useEffect(() => {
    if (file && fileContent) {
      const created = startGoWrapper(file.name, fileContent);
      if (created) {
        setShowEditor(!!created);
        setVirtualFiles(created.split(" "));
        const fileSelector = document.getElementById('file-selector') as HTMLInputElement;
        fileSelector.type = 'text';
        fileSelector.type = 'file';
      }
    }
  }, [fileContent])

  useEffect(() => {

  }, [virtualFiles])

  return (
    <Fragment>
      <input type="file" id="file-selector"/>
      <p>or</p>
        <>
          <form onSubmit={(e) => {
            e.preventDefault();
            const created = startGoWrapper(virtualFileCreation);
            setShowEditor(!!created);
            setVirtualFiles(created.split(" "));
          }}>
            <input type="text" id="create-file-by-name" name="create-file-by-name" placeholder="e.g. example.txt" checked={fileCreatorChecked} onChange={(e) => {
              setVirtualFileCreation(e.target.value);
            }} />
            <button type="submit" id="create-file-btn">Create virtual File</button>
          </form>
        </>
      <div className="App">
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          {virtualFiles.map((virtualFile, index) => {
            return (
              <div key={index} className="file">
                {/* @ts-ignore */}
                <img src={fileImage} alt="file" onDoubleClick={() => setEditorContent(openVirtualFile(virtualFile))}/>
                <div key={index} className="file">{virtualFile}</div>
              </div>
            )
          })}
        </div>
        {showEditor && !!editorContent && <Editor text={editorContent} />}
      </div>
    </Fragment>
  )
}

export default App

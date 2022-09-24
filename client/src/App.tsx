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
  const [editorContent, setEditorContent] = useState<string>('');
  const [virtualFileCreation, setVirtualFileCreation] = useState<string>('');
  const [openFile, setOpenFile] = useState<string>('');

  const saveChanges = (content: string) => {
    console.log(content, openFile)
    // @ts-ignore
    saveVirtualFile(JSON.stringify({
      files: [{
        name: openFile,
        content: content
      }]
    }))
  }

  const closeEditor = () => {
    setOpenFile('');
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
            setVirtualFiles(created.split(" "));
          }}>
            <input type="text" id="create-file-by-name" name="create-file-by-name" placeholder="e.g. example.txt" onChange={(e) => {
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
                <img src={fileImage} alt="file" onDoubleClick={() => {
                  // @ts-ignore
                  setEditorContent(openVirtualFile(virtualFile))
                  setOpenFile(virtualFile);
                }}/>
                <div key={index} className="file">{virtualFile}</div>
              </div>
            )
          })}
        </div>
        {openFile && !!editorContent && <Editor text={editorContent} save={saveChanges} close={closeEditor} />}
      </div>
    </Fragment>
  )
}

export default App

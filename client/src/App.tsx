import { useEffect, useState } from 'react'
import './App.css'
import {initWasm, startGo} from '../actions/wasmReader'
import { Editor } from './components/Editor';

initWasm();

function App() {
  const [file, setFile] = useState<File>();
  const [ fileContent, setFileContent ] = useState<any>();
  const [text, setText] = useState('');
  const [ showEditor, setShowEditor ] = useState<boolean>(false);



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
      const created = startGo(JSON.stringify({
        files: [{
          name: file!.name,
          content: fileContent
        }]
      }));
      if (created) {
        setShowEditor(!!created);
        setText(created);
        const fileSelector = document.getElementById('file-selector') as HTMLInputElement;
        fileSelector.type = 'text';
        fileSelector.type = 'file';
      }
    }
  }, [fileContent])

  return (
    <div className="App">
      <input type="file" accept=".txt" id="file-selector"/>
      {/* {showEditor && <Editor text={text} />} */}
    </div>
  )
}

export default App

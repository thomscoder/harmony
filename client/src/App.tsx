import { useEffect, useState } from 'react'
import './App.css'
import {initWasm, startGo} from '../actions/wasmReader'

initWasm();

function App() {
  const [text, setText] = useState('');
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState<File>();
  const [ fileContent, setFileContent ] = useState<any>();



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
      console.log(created)
    }
  }, [fileContent])

  return (
    <div className="App">
      <input type="file" accept=".txt" id="file-selector"/>
    </div>
  )
}

export default App

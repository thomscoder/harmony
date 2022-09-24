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
      startGo(file.name);
    }
  }, [file]);

  return (
    <div className="App">

      <form onSubmit={(e) => {
        e.preventDefault();
        // @ts-ignore
        return setText(startGo(inputText))
      }}>
        <label htmlFor="repo"></label>
        <input type="text" name="repo" onChange={(e) => {
          setInputText(e.target.value);
        }} />
        <button type="submit">Submit</button>
      </form>
      <div>{text}</div>
      <input type="file" accept=".txt" id="file-selector"/>
    </div>
  )
}

export default App

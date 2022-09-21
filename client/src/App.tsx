import { useEffect, useState } from 'react'
import './App.css'
import {initWasm} from '../actions/wasmReader'

function App() {
  const [text, setText] = useState('');
  const [inputText, setInputText] = useState('');


  useEffect(() =>{
    return () => initWasm()
  }, [])

  return (
    <div className="App">

      <form onSubmit={(e) => {
        e.preventDefault()
      }}>
        <label htmlFor="repo"></label>
        <input type="text" name="repo" onChange={(e) => {
          // @ts-ignore
          return setText(initProject(e.target.value))
        }} />
        <button type="submit">Submit</button>
      </form>
      <div>{text}</div>
    </div>
  )
}

export default App

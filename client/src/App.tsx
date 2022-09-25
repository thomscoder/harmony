import { Fragment, useEffect, useRef, useState } from 'react';
import './App.css';
import { startGo } from '../actions/wasmReader';
import { Editor } from './components/Editor';
import { GrDocumentText as DocumentIcon } from '@react-icons/all-files/gr/GrDocumentText';
import { AiFillGithub as GithubIcon} from '@react-icons/all-files/ai/AiFillGithub';

function App() {
  const [file, setFile] = useState<File>();
  const [fileContent, setFileContent] = useState<any>();
  const [virtualFiles, setVirtualFiles] = useState([]);
  const [editorContent, setEditorContent] = useState<string>('');
  const [virtualFileCreation, setVirtualFileCreation] = useState<string>('');
  const [openFile, setOpenFile] = useState<string>('');
  const [disableAll, setDisableAll] = useState<boolean>(false);
  const [disableFileCreation, setDisableFileCreation] = useState<boolean>(false);
  const [prevOpenedFiles, setPrevOpenedFiles] = useState<Array<string>>([]);

  const fileCreationInput = useRef(null);

  const saveChanges = (content: string) => {
    console.log(content, openFile);
    // @ts-ignore
    saveVirtualFile(
      JSON.stringify({
        files: [
          {
            name: openFile,
            content: content,
          },
        ],
      }),
    );
  };

  const closeEditor = () => {
    setOpenFile('');
  };

  const startGoWrapper = (filename: string, content: string = `Created at: ${new Date().toLocaleString()}`) => {
    return startGo(
      JSON.stringify({
        files: [
          {
            name: filename,
            content: content,
          },
        ],
      }),
    );
  };

  useEffect(() => {
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
        setVirtualFiles(created.split(' '));
        const fileSelector = document.getElementById('file-selector') as HTMLInputElement;
        fileSelector.type = 'text';
        fileSelector.type = 'file';
      }
    }
  }, [fileContent]);

  useEffect(() => {
    const layer = document.querySelector('#layer') as HTMLDivElement;
    if (!!openFile) {
      layer.classList.add('editor-open');
      setDisableAll(true);
    } else {
      layer.classList.remove('editor-open');
      setDisableAll(false);
    }
  }, [openFile]);

  useEffect(() => {
    if (!!virtualFileCreation) {
      setDisableFileCreation(false);
    } else {
      setDisableFileCreation(true);
    }
  }, [virtualFileCreation]);

  return (
    <Fragment>
      <h1>Harmony ✨</h1>
      <div id="layer"></div>
      <div id="github"><a href="https://github.com/thomscoder/harmony" target="_blank"><GithubIcon size={30} /></a></div>
      <div className="file-selectors-wrapper">
        <label className="custom-file-upload">
          <input type="file" id="file-selector" disabled={disableAll} />
          Upload file
        </label>
        <p>or</p>
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const created = startGoWrapper(virtualFileCreation);
              setVirtualFiles(created.split(' '));
              (fileCreationInput.current! as HTMLInputElement).value = '';
            }}
          >
            <input
              ref={fileCreationInput}
              type="text"
              id="create-file-by-name"
              name="create-file-by-name"
              placeholder="e.g. example.txt"
              onChange={(e) => {
                setVirtualFileCreation(e.target.value);
              }}
            />
            <button type="submit" id="create-file-btn" disabled={disableAll || disableFileCreation}>
              Create file
            </button>
          </form>
        </div>
      </div>
      <div className="App">
        <div className="files-area">
          {virtualFiles.map((virtualFile, index) => {
            return (
              <div key={index} className={`virtual-file-wrapper ${!!prevOpenedFiles.find((f) => f === virtualFile) ? 'modified' : ''}`}>
                <DocumentIcon
                  size={60}
                  onDoubleClick={() => {
                    // @ts-ignore
                    setEditorContent(openVirtualFile(virtualFile));
                    setOpenFile(virtualFile);
                    setPrevOpenedFiles((prev: Array<string>) => [...prev, virtualFile]);
                  }}
                />
                <div key={index} className="file">
                  {virtualFile}
                </div>
              </div>
            );
          })}
        </div>
        {openFile && !!editorContent && (
          <div className="nova-editor">
            <Editor text={editorContent} save={saveChanges} close={closeEditor} filename={openFile} />
          </div>
        )}
      </div>
    </Fragment>
  );
}

export default App;

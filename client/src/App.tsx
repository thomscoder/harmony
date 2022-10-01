import { Fragment, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { IoMdDocument as DocumentIcon } from '@react-icons/all-files/io/IoMdDocument';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { actionState, virtualFilesState } from './atoms/atoms';
import { openVirtualFilesWrapper, saveVirtualFilesWrapper } from './utils/goFunctions';
import Actions from './components/Actions/Actions';

import Files from './components/Files/Files';
import { Editor } from './components/Editor/Editor';
import HarmonyMenu from './components/Menu/Menu';
import { HELP } from './utils/texts';
import { keyChecker } from './utils/utilityFunctions';

// css
import './App.css';

function App() {
  const virtualFiles = useRecoilValue(virtualFilesState);
  const setAction = useSetRecoilState(actionState);

  const [editorContent, setEditorContent] = useState<string>('');
  const [openFile, setOpenFile] = useState<string>('');
  const [prevOpenedFiles, setPrevOpenedFiles] = useState<Array<string>>([]);

  const clickOnFileHandler = (virtualFile: never) => {
    setEditorContent(openVirtualFilesWrapper(virtualFile));
    setOpenFile(virtualFile);
    setPrevOpenedFiles((prev: Array<string>) => [...prev, virtualFile]);
  };

  const saveChanges = (content: string) => {
    saveVirtualFilesWrapper(openFile, content);
  };

  const closeEditor = () => {
    setOpenFile('');
  };

  const keyboardShortcut = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.shiftKey) {
        setAction(keyChecker(e.key)!);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', keyboardShortcut);

    if (!localStorage.getItem('harmony-tutorial')) {
      setAction(HELP);
      localStorage.setItem('harmony-tutorial', 'true');
    }

    return () => {
      window.removeEventListener('keydown', keyboardShortcut);
    };
  }, []);

  return (
    <Fragment>
      <HarmonyMenu />
      <Actions />
      <Files />
      <div className="App">
        <div className="files-area">
          {virtualFiles.map((virtualFile, index) => {
            return (
              <Draggable key={index} bounds="parent">
                <div className={`virtual-file-wrapper ${!!prevOpenedFiles.find((f) => f === virtualFile) ? 'modified' : ''}`}>
                  <DocumentIcon size={60} onDoubleClick={() => clickOnFileHandler(virtualFile)} />
                  <div key={index} className="file">
                    {virtualFile}
                  </div>
                </div>
              </Draggable>
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

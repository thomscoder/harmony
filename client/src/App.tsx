import { Fragment, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { isMobile } from 'react-device-detect';

import { IoMdDocument as DocumentIcon } from '@react-icons/all-files/io/IoMdDocument';
import { IoIosFolderOpen as FolderIcon } from '@react-icons/all-files/io/IoIosFolderOpen';
import { AiOutlineArrowLeft as BackArrowIcon } from '@react-icons/all-files/ai/AiOutlineArrowLeft';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { actionState, freeModeDisabledState, virtualFilesState } from './atoms/atoms';
import { exploreDirectoryWrapper, isDirectoryWrapper, openVirtualFilesWrapper, saveVirtualFilesWrapper } from './utils/goFunctions';
import Actions from './components/Actions/Actions';

import Files from './components/Files/Files';
import { Editor } from './components/Editor/Editor';
import HarmonyMenu from './components/Menu/Menu';
import { HELP } from './utils/texts';
import { keyChecker } from './utils/utilityFunctions';

// css
import './App.css';

function App() {
  const [virtualFiles, setVirtualFiles] = useRecoilState(virtualFilesState);
  const setAction = useSetRecoilState(actionState);
  const freeModeDisabled = useRecoilValue(freeModeDisabledState);

  const [editorContent, setEditorContent] = useState<string>('');
  const [openFile, setOpenFile] = useState<string>('');
  const [prevOpenedFiles, setPrevOpenedFiles] = useState<Array<string>>([]);
  const [openDir, setOpenDir] = useState<string>('');
  const [oldVirtualFiles, setOldVirtualFiles] = useState<Array<never>>([]);
  
  const goBackInDirectories = () => {
    if (oldVirtualFiles.length > 0) {
      setVirtualFiles([...oldVirtualFiles]);
      return setOldVirtualFiles([])
    }
  }

  const clickOnFileHandler = (virtualFile: never, isDirectory: boolean = false) => {
    if (!isDirectory) {
      // Get the file content from Go functions
      // Open the file
      setEditorContent(openVirtualFilesWrapper(virtualFile));
      setPrevOpenedFiles((prev: Array<string>) => [...prev, virtualFile]);
      setOpenFile(virtualFile);
    } else {
      // Keep track of the directory you open to go back
      setOldVirtualFiles(virtualFiles);
      // Explore direcory
      setVirtualFiles(exploreDirectoryWrapper(virtualFile) as never[]);
      setOpenDir(virtualFile);
    }
  };

  const saveChanges = (content: string) => {
    saveVirtualFilesWrapper(openFile, content);
  };

  const closeEditor = () => {
    setOpenFile('');
  };

  const keyboardShortcut = (e: KeyboardEvent) => {
    // Keyboard shortcuts
    if (e.metaKey || e.ctrlKey) {
      if (e.shiftKey) {
        setAction(keyChecker(e.key)!);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', keyboardShortcut);
    // Show the tutorial
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
        <div className={`files-area ${oldVirtualFiles.length > 0 ? 'dir-open' : ''}`} style={filesAreaStyle}>
          {oldVirtualFiles.length > 0 && <div className="dir-menu">
            {openDir}
            <BackArrowIcon onClick={goBackInDirectories}/>
            </div>}
          {virtualFiles.map((virtualFile, index) => {
            // Check if directory
            const isDirectory = isDirectoryWrapper(virtualFile);
            // Check if file was prev opened
            const prevOpened = !!prevOpenedFiles.find((f) => f === virtualFile) ? 'modified' : '';
            // Regex on name
            const virtualFileName = (virtualFile as string).split('/').at(-1);
            // Double click on files to open (on mobile should disable the drag - from the menu)
            return (
              <Draggable key={index} bounds="parent" disabled={freeModeDisabled}>
                <div
                  onDoubleClick={() => {
                    clickOnFileHandler(virtualFile, isDirectory);
                  }}
                  className={`virtual-file-wrapper ${prevOpened}`}
                >
                  {isDirectory ?  <FolderIcon size={60} /> : <DocumentIcon size={60} />}
                  <div key={index} className="file">
                    {virtualFileName}
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

const filesAreaStyle = {
  alignContent: isMobile ? 'flex-start' : 'center',
  justifyContent: isMobile ? 'flex-end' : 'center',
};

export default App;

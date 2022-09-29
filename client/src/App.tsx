import { Fragment, useEffect, useState } from 'react';
import { openVirtualFilesWrapper, saveVirtualFilesWrapper } from '../utils/goFunctions';
import { Editor } from './components/Editor';
import { GrDocumentText as DocumentIcon } from '@react-icons/all-files/gr/GrDocumentText';
import Repository from './components/Repository';

import { useRecoilValue } from 'recoil';

import { virtualFilesState } from './atoms/atoms';
import Files from './components/Files';
import HomepageMisc from './components/HomepageMisc';

import './App.css';

function App() {
  const virtualFiles = useRecoilValue(virtualFilesState);

  const [editorContent, setEditorContent] = useState<string>('');
  const [openFile, setOpenFile] = useState<string>('');
  const [disableAll, setDisableAll] = useState<boolean>(false);
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

  return (
    <Fragment>
      <HomepageMisc />
      <Files disableAll={disableAll} />
      <div className="App">
        <div className="files-area">
          {virtualFiles.map((virtualFile, index) => {
            return (
              <div key={index} className={`virtual-file-wrapper ${!!prevOpenedFiles.find((f) => f === virtualFile) ? 'modified' : ''}`}>
                <DocumentIcon size={60} onClick={() => clickOnFileHandler(virtualFile)} />
                <div key={index} className="file">
                  {virtualFile}
                </div>
              </div>
            );
          })}
        </div>
        <Repository />
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

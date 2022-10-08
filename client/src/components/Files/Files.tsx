import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { createVirtualFilesWrapper } from '../../utils/goFunctions';
import { actionState, createVirtualBranchMessageState, virtualBranchState, virtualFilesState } from '../../atoms/atoms';

import { AiOutlineClose as CloseIcon } from '@react-icons/all-files/ai/AiOutlineClose';

import { CREATE_FILE, UPLOAD_FILE } from '../../utils/texts';

const Files = () => {
  const setVirtualFiles = useSetRecoilState(virtualFilesState);
  const virtualBranch = useRecoilValue(virtualBranchState);
  const setCreateVirtualBranchMessage = useSetRecoilState(createVirtualBranchMessageState);
  const [action, setAction] = useRecoilState(actionState);

  const [file, setFile] = useState<File>();
  const [fileContent, setFileContent] = useState<any>();
  const [virtualFileCreation, setVirtualFileCreation] = useState<string>('');
  const [disableFileCreation, setDisableFileCreation] = useState<boolean>(false);

  const fileCreationInputRef = useRef(null);

  const handleCloseClick = () => {
    setAction('');
  };

  const disabledInputClickHandler = () => {
    if (!!virtualBranch === false) {
      setCreateVirtualBranchMessage('Create or checkout to a branch');
    }
  };

  const fileSelectorHandler = (e: any) => {
    e.preventDefault();
    const created = createVirtualFilesWrapper(virtualFileCreation);
    setVirtualFiles(created.split(' '));
    (fileCreationInputRef.current! as HTMLInputElement).value = '';
    setAction('');
  };

  useEffect(() => {
    if (action === UPLOAD_FILE) {
      const fileSelector = document.getElementById('file-selector') as HTMLInputElement;
      fileSelector.addEventListener('change', (event) => {
        // @ts-ignore
        const fileList = event?.target!.files;
        setFile(fileList[0]);
      });
    } else {
      if (fileCreationInputRef.current!) (fileCreationInputRef.current! as HTMLInputElement).focus();
    }
  }, [action]);

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
      const created = createVirtualFilesWrapper(file.name, fileContent);
      if (created) {
        setVirtualFiles(created.split(' '));
        const fileSelector = document.getElementById('file-selector') as HTMLInputElement;
        fileSelector.type = 'text';
        fileSelector.type = 'file';
      }
    }
  }, [fileContent]);

  useEffect(() => {
    if (!!virtualFileCreation) {
      setDisableFileCreation(false);
    } else {
      setDisableFileCreation(true);
    }
  }, [virtualFileCreation]);

  return (
    <>
      <div className="file-selectors-wrapper">
        {action === UPLOAD_FILE && (
          <div className="text-input-wrapper">
            <label className="custom-file-upload" onClick={disabledInputClickHandler}>
              <input type="file" id="file-selector" />
              Click to upload a file
            </label>
            <span className="close-btn">
              <CloseIcon onClick={handleCloseClick} />
            </span>
          </div>
        )}
        <div>
          {action === CREATE_FILE && !!virtualBranch && (
            <form onSubmit={fileSelectorHandler} onClick={disabledInputClickHandler}>
              <div className="text-input-wrapper">
                <input
                  ref={fileCreationInputRef}
                  type="text"
                  id="create-file-by-name"
                  name="create-file-by-name"
                  placeholder="Insert filename e.g. example.txt"
                  onChange={(e) => {
                    setVirtualFileCreation(e.target.value);
                  }}
                />
                <span className="close-btn">
                  <CloseIcon onClick={handleCloseClick} />
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Files;

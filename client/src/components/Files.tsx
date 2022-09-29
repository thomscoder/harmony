import { useEffect, useRef, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { createVirtualFilesWrapper } from '../../utils/goFunctions';
import { virtualBranchState, virtualFilesState } from '../atoms/atoms';

type Props = {
  disableAll: boolean;
};

const Files = ({ disableAll }: Props) => {
  const setVirtualFiles = useSetRecoilState(virtualFilesState);
  const virtualBranch = useRecoilValue(virtualBranchState);

  const [file, setFile] = useState<File>();
  const [fileContent, setFileContent] = useState<any>();
  const [virtualFileCreation, setVirtualFileCreation] = useState<string>('');
  const [disableFileCreation, setDisableFileCreation] = useState<boolean>(false);

  const fileCreationInput = useRef(null);

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
        <label className="custom-file-upload">
          <input type="file" id="file-selector" disabled={disableAll || !!virtualBranch === false} />
          Upload file
        </label>
        <p>or</p>
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const created = createVirtualFilesWrapper(virtualFileCreation);
              setVirtualFiles(created.split(' '));
              (fileCreationInput.current! as HTMLInputElement).value = '';
            }}
          >
            <input
              disabled={!!virtualBranch === false}
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
    </>
  );
};

export default Files;

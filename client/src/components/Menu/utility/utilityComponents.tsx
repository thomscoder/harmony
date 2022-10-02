import { AiOutlineFile as FileIcon } from '@react-icons/all-files/ai/AiOutlineFile';
import { AiOutlineBranches as BranchIcon } from '@react-icons/all-files/ai/AiOutlineBranches';
import { AiOutlineCloudUpload as UploadFileIcon } from '@react-icons/all-files/ai/AiOutlineCloudUpload';
import { VscGitCommit as CommitIcon } from '@react-icons/all-files/vsc/VscGitCommit';
import { AiFillGithub as GithubIcon } from '@react-icons/all-files/ai/AiFillGithub';
import { BsUnlock as UnlockedIcon } from '@react-icons/all-files/bs/BsUnlock';
import { BsLock as LockedIcon } from '@react-icons/all-files/bs/BsLock';
import { useRecoilState } from 'recoil';
import { freeModeDisabledState } from '../../../atoms/atoms';

export const AddFile = () => {
  return (
    <>
      <div className="menu-action create-file">
        <FileIcon />
        <span>Create a file</span>
      </div>
    </>
  );
};

export const CreateBranch = () => {
  return (
    <>
      <div className="menu-action create-branch">
        <BranchIcon />
        <span>Checkout to a branch</span>
      </div>
    </>
  );
};

export const CreateCommit = () => {
  return (
    <>
      <div className="menu-action create-commit">
        <CommitIcon />
        <span>Commit changes</span>
      </div>
    </>
  );
};

export const UploadFile = () => {
  return (
    <>
      <div className="menu-action upload-file">
        <UploadFileIcon />
        <span>Upload a file</span>
      </div>
    </>
  );
};

export const Contributors = () => {
  return (
    <>
      <div className="contributors">
        <div id="github">
          <a href="https://github.com/thomscoder/harmony" target="_blank">
            <GithubIcon />
            <span>Go to the repository</span>
          </a>
        </div>
      </div>
    </>
  );
};

export const FreeMode = ({ handleClose }: { handleClose: () => void }) => {
  const [freeModeDisabled, setFreeModeDisabled] = useRecoilState(freeModeDisabledState);
  return (
    <>
      <div className="menu-action">
        {!freeModeDisabled && (
          <div
            onClick={() => {
              setFreeModeDisabled(true);
              handleClose();
            }}
          >
            <LockedIcon size={20} />
            <span>Lock file drag</span>
          </div>
        )}
        {freeModeDisabled && (
          <div
            onClick={() => {
              setFreeModeDisabled(false);
              handleClose();
            }}
          >
            <UnlockedIcon size={20} />
            <span>Unlock file drag</span>
          </div>
        )}
      </div>
    </>
  );
};

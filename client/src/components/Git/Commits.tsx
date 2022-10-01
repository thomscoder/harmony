import { useEffect, useRef, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { virtualCommitWrapper } from '../../utils/goFunctions';
import { actionState, createVirtualBranchMessageState, virtualBranchState } from '../../atoms/atoms';

import { AiOutlineClose as CloseIcon } from '@react-icons/all-files/ai/AiOutlineClose';

import '../styles/Commit.css';

const Commit = () => {
  const virtualBranch = useRecoilValue(virtualBranchState);
  const setCreateVirtualBranchMessage = useSetRecoilState(createVirtualBranchMessageState);
  const setAction = useSetRecoilState(actionState);

  const [commitMsg, setCommitMsg] = useState<string>();
  const [commits, setCommits] = useState();
  const [commitError, setCommitError] = useState<boolean>(false);
  const [commitSuccess, setCommitSuccess] = useState<boolean>(false);
  const [commitSuccessMessage, setCommitSuccessMessage] = useState<string>('');
  const [commitErrorMessage, setCommitErrorMessage] = useState<string>('');
  const inputCommitRef = useRef(null);

  const handleCloseClick = () => {
    setAction('');
  };

  const disabledInputClickHandler = () => {
    if (!!virtualBranch === false) {
      setCreateVirtualBranchMessage('Create or checkout to a branch');
    }
  };

    useEffect(() => {
      (inputCommitRef.current! as HTMLInputElement).focus();
    }, [])

  useEffect(() => {
    if (commitSuccess) (inputCommitRef.current! as HTMLInputElement).classList.add('commit-success');
    if (!commitSuccess) (inputCommitRef.current! as HTMLInputElement).classList.remove('commit-success');

    if (commitError) (inputCommitRef.current! as HTMLInputElement).classList.add('commit-error');
    if (!commitError) (inputCommitRef.current! as HTMLInputElement).classList.remove('commit-error');
  }, [commitError, commitSuccess]);

  const commitsFormHandler = (e: any) => {
    e.preventDefault();
    (inputCommitRef.current! as HTMLInputElement).value = '';
    // creates a new commit
    const commit = virtualCommitWrapper(commitMsg as string);
    if (typeof commit === 'string') {
      setCommitErrorMessage(`${commit} - Try again`);
      return setCommitError(true);
    }
    setCommits(commit);
    setCommitSuccessMessage('Committed successfully');
    return setCommitSuccess(true);
  };

  const commitsInputOnChangeHandler = (e: any) => {
    setCommitMsg(e.target.value);
    setCommitError(false);
    setCommitSuccess(false);
  };

  return (
    <>
      <form className="commit-form" onClick={disabledInputClickHandler} onSubmit={commitsFormHandler}>
        <div className="text-input-wrapper">
          <input
            disabled={!!virtualBranch === false}
            ref={inputCommitRef}
            type="text"
            placeholder={commitSuccess ? commitSuccessMessage : commitError ? commitErrorMessage : `Commit message - Press Enter to submit`}
            className="commit-msg-input"
            onChange={commitsInputOnChangeHandler}
          />
          <span className="close-btn">
            <CloseIcon onClick={handleCloseClick} />
          </span>
        </div>
      </form>
    </>
  );
};

export default Commit;
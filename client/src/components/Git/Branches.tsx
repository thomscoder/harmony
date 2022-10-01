import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { virtualFilesState, virtualBranchState,  actionState, virtualBranchesState } from '../../atoms/atoms';
import { getVirtualFilesWrapper, goToBranchWrapper } from '../../utils/goFunctions';

import { AiOutlineClose as CloseIcon } from '@react-icons/all-files/ai/AiOutlineClose';
import '../styles/Branches.css';

const Branches = () => {
  const setVirtualFiles = useSetRecoilState(virtualFilesState);
  const [virtualBranch, setVirtualBranch] = useRecoilState(virtualBranchState);
  const setAction = useSetRecoilState(actionState);

  const [branches, setBranches] = useRecoilState(virtualBranchesState);
  const [branchName, setBranchName] = useState<string>('');
  const inputBranchRef = useRef(null);

  useEffect(() => {
    (inputBranchRef.current! as HTMLInputElement).focus();
  }, [])

  useEffect(() => {
    if (!!branchName) {
      // Gets files stored in the current worktree
      setVirtualFiles(getVirtualFilesWrapper());
      setVirtualBranch(branchName);
      setAction('');
    }
  }, [branches]);

  const handleCloseClick = () => {
    setAction('');
  };

  const addBranchHandler = (e: any) => {
    e.preventDefault();
    (inputBranchRef.current! as HTMLInputElement).value = '';
    // Checkout to branch - creates a new branch if it doesn't exist
    setBranches(goToBranchWrapper(branchName));
  };

  return (
    <>
      <div className="add-branches">
        <form onSubmit={addBranchHandler} className="branch-creation-form">
          <div className="text-input-wrapper">
            <input ref={inputBranchRef} name="branch-name" type="text" placeholder="Branch name - Press Enter to submit" className="branch-name-input" onChange={(e) => setBranchName(e.target.value)} />
            <span className="close-btn">
              <CloseIcon onClick={handleCloseClick} />
            </span>
          </div>
          
        </form>
      </div>
    </>
  );
};

export default Branches;

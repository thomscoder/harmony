import './styles/Branches.css';
import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { virtualFilesState, virtualBranchState, createVirtualBranchMessageState } from '../atoms/atoms';
import { getVirtualFilesWrapper, goToBranchWrapper } from '../../utils/goFunctions';

const Branches = () => {
  const setVirtualFiles = useSetRecoilState(virtualFilesState);
  const [virtualBranch, setVirtualBranch] = useRecoilState(virtualBranchState);
  const createVirtualBranchMessage = useRecoilValue(createVirtualBranchMessageState)

  const [branches, setBranches] = useState<Array<string>>([]);
  const [branchName, setBranchName] = useState<string>('');
  const inputBranchRef = useRef(null);

  useEffect(() => {
    if (!!branchName) {
      // Gets files stored in the current worktree
      setVirtualFiles(getVirtualFilesWrapper());
      setVirtualBranch(branchName);
    }
  }, [branches]);

  useEffect(() => {
    if (!!createVirtualBranchMessage) {
      (inputBranchRef.current! as HTMLInputElement).focus();
    }
  }, [createVirtualBranchMessage])

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
          <input ref={inputBranchRef} name="branch-name" type="text" placeholder="Branch name - Press Enter to submit" className="branch-name-input" onChange={(e) => setBranchName(e.target.value)} />
          <span className="current-branch-name">{!!virtualBranch === false ? <span className="branch-name">{createVirtualBranchMessage}</span> : 
            branches.map((branch, index) => {
              const active = branch === virtualBranch ? "active-branch" : '';
              return <span className={`branch-name ${active}`} onClick={() => {
                setBranchName(branch);
                setBranches(goToBranchWrapper(branch));
              }} key={index}>{branch}</span>
            })
          }</span>
        </form>
      </div>
    </>
  );
};

export default Branches;

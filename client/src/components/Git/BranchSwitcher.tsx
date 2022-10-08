import { MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { actionState, virtualBranchesState, virtualBranchState, virtualFilesState } from '../../atoms/atoms';
import { getVirtualFilesWrapper, goToBranchWrapper } from '../../utils/goFunctions';

const BranchSwitcher = () => {
  const setVirtualFiles = useSetRecoilState(virtualFilesState);
  const [virtualBranch, setVirtualBranch] = useRecoilState(virtualBranchState);
  const setAction = useSetRecoilState(actionState);

  const [branches, setBranches] = useRecoilState(virtualBranchesState);

  const [branchName, setBranchName] = useState<string>('');

  const handleMenuItemClick = (event: React.MouseEvent<HTMLElement>, branch: string) => {
    setBranchName(branch);
    setBranches(goToBranchWrapper(branch));
  };

  useEffect(() => {
    if (!!branchName) {
      // Gets files stored in the current worktree
      setVirtualFiles(getVirtualFilesWrapper());
      setVirtualBranch(branchName);
      setAction('');
    }
  }, [branches]);

  return (
    <div id="graph-branches-list">
      {branches.map((branch, index) => {
        const active = branch === virtualBranch ? 'active-branch' : '';
        return (
          <MenuItem className={`menu-actions branch-name ${active}`} key={index} onClick={(event) => handleMenuItemClick(event, branch)}>
            {branch}
          </MenuItem>
        );
      })}
    </div>
  );
};

export default BranchSwitcher;

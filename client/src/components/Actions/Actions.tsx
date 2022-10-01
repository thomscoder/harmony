import { useRecoilValue } from 'recoil';
import { actionState, virtualBranchState } from '../../atoms/atoms';
import { CREATE_BRANCH, CREATE_COMMIT } from '../../utils/texts';
import Branches from '../Git/Branches';
import Commit from '../Git/Commits';

const Actions = () => {
  const getAction = useRecoilValue(actionState);
  const virtualBranch = useRecoilValue(virtualBranchState);

  return (
    <>
      {getAction === CREATE_COMMIT && !!virtualBranch && <Commit />}
      {getAction === CREATE_BRANCH && <Branches />}
    </>
  );
};

export default Actions;

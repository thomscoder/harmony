import { useRecoilValue } from 'recoil';
import { actionState, virtualBranchState } from '../../atoms/atoms';
import { CREATE_BRANCH, CREATE_COMMIT, GRAPH_MODE } from '../../utils/texts';
import Branches from '../Git/Branches';
import Commit from '../Git/Commits';
import GitGraphWrapper from '../Git/GitGraphWrapper';

const Actions = () => {
  const getAction = useRecoilValue(actionState);
  const virtualBranch = useRecoilValue(virtualBranchState);

  return (
    <>
      {getAction === CREATE_COMMIT && !!virtualBranch && <Commit />}
      {getAction === CREATE_BRANCH && <Branches />}
      {getAction === GRAPH_MODE && <GitGraphWrapper />}
    </>
  );
};

export default Actions;

import { useState } from 'react';

import { AiOutlineBranches as BranchIcon } from '@react-icons/all-files/ai/AiOutlineBranches';

import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import Button from '@mui/material/Button';

import { actionState, virtualBranchesState } from '../../atoms/atoms';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { GRAPH_MODE } from '../../utils/texts';

const BootstrapTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} arrow classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
  },
}));

const ShowGraph = () => {
  const branches = useRecoilValue(virtualBranchesState);
  const setAction = useSetRecoilState(actionState);

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleClickOpen = () => {
    setAction((prev: string) => {
      return !!prev ? '' : GRAPH_MODE;
    });
  };

  return (
    <>
      {branches.length === 0 ? (
        <BootstrapTooltip open={tooltipOpen} title="Checkout to a branch">
          <div
            onClick={() => {
              setTooltipOpen((prev) => !prev);
            }}
          >
            <Button disabled aria-describedby={'show-graph'}>
              <BranchIcon size={25} />
            </Button>
          </div>
        </BootstrapTooltip>
      ) : (
        <Button aria-describedby={'show-graph'} onClick={handleClickOpen}>
          <BranchIcon size={25} />
        </Button>
      )}
    </>
  );
};

export default ShowGraph;

import { forwardRef, useEffect, useState } from 'react';

import { AiOutlineBranches as BranchIcon } from '@react-icons/all-files/ai/AiOutlineBranches';

import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';

import { virtualBranchesState, virtualBranchState, virtualFilesState } from '../../atoms/atoms';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { getVirtualFilesWrapper, goToBranchWrapper } from '../../utils/goFunctions';


const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const BootstrapTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
  },
}));

const SwitchBranch = () => {
  const setVirtualFiles = useSetRecoilState(virtualFilesState);

  const [virtualBranch, setVirtualBranch] = useRecoilState(virtualBranchState);
  const [branches, setBranches] = useRecoilState(virtualBranchesState);

    const [open, setOpen] = useState(false);
    const [tooltipOpen, setTooltipOpen] = useState(false);

  const [branchName, setBranchName] = useState<string>('');



  useEffect(() => {
    if (!!branchName) {
      // Gets files stored in the current worktree
      setVirtualFiles(getVirtualFilesWrapper());
      setVirtualBranch(branchName);
    }
  }, [branches]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleMenuItemClick = (event: React.MouseEvent<HTMLElement>, branch: string) => {
        setBranchName(branch);
        setBranches(goToBranchWrapper(branch));
    };

  const id = open ? 'simple-popover' : undefined;

    return (
        <>
          {
            branches.length === 0 ?
            <BootstrapTooltip open={tooltipOpen} title="Checkout to a branch">
              <div onClick={() => {setTooltipOpen(prev => !prev)}}>
                <Button disabled aria-describedby={id}>
                  <BranchIcon size={25} />
                </Button>
              </div>
            </BootstrapTooltip>
          :
            <Button aria-describedby={id} onClick={handleClickOpen}>
              <BranchIcon size={25} />
            </Button>
          }
        <Dialog open={open} TransitionComponent={Transition} keepMounted onClose={handleClose} aria-describedby="alert-dialog-slide-description">
          <DialogTitle>{'Your branches'}</DialogTitle>
            {branches.map((branch, index) => {
              const active = branch === virtualBranch ? 'active-branch' : '';
                return (
                  <MenuItem className={`menu-actions branch-name ${active}`} key={index} onClick={(event) => handleMenuItemClick(event, branch)}>
                    {branch}
                  </MenuItem>
                )
              })}
        </Dialog>
        </>
    )
}

export default SwitchBranch;
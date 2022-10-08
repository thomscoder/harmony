import { forwardRef, useEffect, useState } from 'react';

import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { Divider, styled } from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

// icons
import { RiLayoutGridFill as MenuIcon } from '@react-icons/all-files/ri/RiLayoutGridFill';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { actionState, virtualBranchState } from '../../atoms/atoms';

import { AddFile, Contributors, CreateBranch, CreateCommit, FreeMode, UploadFile } from './utility/utilityComponents';
import { CREATE_BRANCH, HELP } from '../../utils/texts';

import { options } from './utility/menuOptions';
import Help from './Help';
import ShowGraph from './ShowGraph';
import Clock from './Clock';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const icons = [<AddFile />, <UploadFile />, <CreateBranch />, <CreateCommit />];

const BootstrapTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} arrow classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
  },
}));

const HarmonyMenu = () => {
  const setAction = useSetRecoilState(actionState);
  const virtualBranch = useRecoilValue(virtualBranchState);

  const [open, setOpen] = useState(false);
  const [openTooltip, setOpenTooltip] = useState(true);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleMenuItemClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    if (options.has(index)) {
      setAction(options.get(index) as string);
      handleClose();
    }
  };

  const handleTooltip = () => {
    setOpenTooltip(false);
  };

  useEffect(() => {
    const timeout = setTimeout(handleTooltip, 3000);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const id = open ? 'simple-popover' : undefined;

  return (
    <div className="menu-wrapper">
      <div>
        <BootstrapTooltip open={openTooltip} title="menu">
          <Button
            sx={{
              color: '#ffac4b',
            }}
            aria-describedby={id}
            onClick={handleClickOpen}
          >
            <MenuIcon size={25} />
          </Button>
        </BootstrapTooltip>
        <Dialog open={open} TransitionComponent={Transition} keepMounted onClose={handleClose} aria-describedby="alert-dialog-slide-description">
          {icons.map((icon, index) => {
            const option = options.get(index);
            const disabled = !!virtualBranch === false && option !== CREATE_BRANCH && option !== HELP;
            return (
              <MenuItem disabled={disabled} key={index} className="menu-actions" onClick={(event) => handleMenuItemClick(event, index)}>
                {icon}
              </MenuItem>
            );
          })}
          <Divider />
          <MenuItem>
            <FreeMode handleClose={handleClose} />
          </MenuItem>
          <MenuItem>
            <Contributors />
          </MenuItem>
        </Dialog>
      </div>
      <ShowGraph />
      <Help />
      <Clock />
    </div>
  );
};

export default HarmonyMenu;

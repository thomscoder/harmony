import { forwardRef, useState } from 'react';

import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { Divider } from '@mui/material';
import { DialogContent } from '@mui/material';

// icons
import { RiMoonClearFill as MoonIcon } from '@react-icons/all-files/ri/RiMoonClearFill';


import { useRecoilValue, useSetRecoilState } from 'recoil';
import { actionState, virtualBranchState } from '../../atoms/atoms';


import { AddFile, Contributors, CreateBranch, CreateCommit, UploadFile } from './utility/utilityComponents';
import { CREATE_BRANCH, HELP } from '../../utils/texts';

import { options } from './utility/menuOptions';
import Help from './Help';
import SwitchBranch from './SwitchBranch';
import Clock from './Clock';

import '../styles/Menu.css';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});



const icons = [<AddFile />, <UploadFile />, <CreateBranch />, <CreateCommit />];


const HarmonyMenu = () => {
  const setAction = useSetRecoilState(actionState);
  const virtualBranch = useRecoilValue(virtualBranchState);

  const [open, setOpen] = useState(false);

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

  const id = open ? 'simple-popover' : undefined;

  return (
    <div className="menu-wrapper">
      <div>
        <Button sx={{
          color: '#ffac4b',
        }} aria-describedby={id} onClick={handleClickOpen}>
          <MoonIcon size={25} />
        </Button>
        <Dialog open={open} TransitionComponent={Transition} keepMounted onClose={handleClose} aria-describedby="alert-dialog-slide-description">
          <DialogTitle>{'What do you want to do?'}</DialogTitle>
          {icons.map((icon, index) => {
            const option = options.get(index)
            const disabled = !!virtualBranch === false && option !== CREATE_BRANCH && option !== HELP 
            return (
              <MenuItem disabled={disabled} key={index} className="menu-actions" onClick={(event) => handleMenuItemClick(event, index)}>
                {icon}
              </MenuItem>
            )
          })}
          <Divider/>
          <DialogContent>
            <Contributors />
          </DialogContent>
        </Dialog>
      </div>
      <SwitchBranch />
      <Help />
      <Clock />
    </div>
  );
};

export default HarmonyMenu;

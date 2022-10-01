import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { Divider } from '@mui/material';


import {BiHelpCircle as HelpIcon } from '@react-icons/all-files/bi/BiHelpCircle';


import { forwardRef, useState } from "react";
import { actionState } from '../../atoms/atoms';
import { useRecoilState } from 'recoil';
import { HELP } from '../../utils/texts';


const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});


const Help = () => {
  const [action, setAction] = useRecoilState(actionState)

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const id = open ? 'simple-popover' : undefined;

    return (
        <>
            <div className="help-harmony">
            <Button sx={{
              color: '#fff',
              opacity: '0.3'
            }} aria-describedby={id} onClick={handleClickOpen}>
                <HelpIcon size={25} />
            </Button>
                <Dialog open={open || action === HELP} TransitionComponent={Transition} keepMounted onClose={handleClose} aria-describedby="alert-dialog-slide-description">
                <DialogTitle>{'Harmony✨'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        Harmony is a minimalistic Git interface ran entirely on the Web.
                        <br/>
                        Create, upload and edit mulitple files, on the fly, in the browser.
                        Create branches and commits, in-memory, to keep track of your changes.
                        Powered by WebAssembly. 
                        <br/>
                        <br/>
                        On page load, Harmony clones an empty repository (only README and LICENSE files present)
                        and asks you to switch to a branch to start keeping track of what you do.
                        
                        But it is up to you when (and if) to commit (locally - in-memory for now) the changes.

                        By committing you can freely switch between branches without losing what you have done.
                        <h3>Shortcuts</h3>
                        - <strong>Ctrl + Shift + B</strong> : Create a branch (or switching to one)<br/>
                        - <strong>Ctrl + Shift + C</strong> : Create a new commit<br/>
                        - <strong>Ctrl + Shift + F</strong> : Create a new file<br/>
                        - <strong>Ctrl + Shift + U </strong>: Upload a new file<br/>
                        - <strong>Ctrl + Shift + H</strong> : Open this guide<br/>
                        <Divider />
                      <video width="100%" src="https://user-images.githubusercontent.com/78874117/193406968-cf0b44c6-c5a9-4e14-9085-edbea06bf59e.mp4" controls autoPlay></video>
                    </DialogContentText>
                    {
                      !localStorage.getItem('harmony-tutorial') && (
                        <Button sx={{
                          backgroundColor: '#d5a5f7',
                          color: '#fff'
                        }} onClick={() => setAction('')}>
                            Close
                        </Button>
                      )
                    }
                </DialogContent>
                </Dialog>
            </div>
        </>
    )
}

export default Help;
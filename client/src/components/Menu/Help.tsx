import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';

import { BiHelpCircle as HelpIcon } from '@react-icons/all-files/bi/BiHelpCircle';

import { forwardRef, useState } from 'react';
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
  const [action, setAction] = useRecoilState(actionState);

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
        <Button
          sx={{
            color: '#fff',
            opacity: '0.3',
          }}
          aria-describedby={id}
          onClick={handleClickOpen}
        >
          <HelpIcon size={25} />
        </Button>
        <Dialog open={open || action === HELP} TransitionComponent={Transition} keepMounted onClose={handleClose} aria-describedby="alert-dialog-slide-description">
          <DialogTitle>{'Harmony✨'}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Harmony is a minimalistic Git interface ran entirely on the Web.
              <br />
              Create, upload and edit mulitple files, on the fly, in the browser. Create branches and commits, in-memory, to keep track of your changes. Powered by WebAssembly.
              <br />
              <br />
              On page load, Harmony clones an empty repository (only README and LICENSE files present) and asks you to switch to a branch to start keeping track of what you do.
              <br />
              After that you can start uploading or creating files, branches, commits and so on...
              <br />
              It is up to you when (and if) to commit (locally - in-memory for now) the changes. By committing you can freely switch between branches without losing what you have done.
              <br />
              Refresh the page to restart anew.
              <br />
              <br />
              Double click on file to open the editor.
              <br />
              (Lock and unlock file drag - on mobile lock the drag to edit the content of a file)
              <br />
              <br />
              <strong>Shortcuts</strong>
              <br />- <strong>Ctrl + Shift + B</strong> : Create a branch (or switching to one)
              <br />- <strong>Ctrl + Shift + K</strong> : Create a new commit
              <br />- <strong>Ctrl + Shift + F</strong> : Create a new file
              <br />- <strong>Ctrl + Shift + U </strong>: Upload a new file
              <br />- <strong>Ctrl + Shift + H</strong> : Open this guide
              <br />
              <video width="100%" src="https://user-images.githubusercontent.com/78874117/193465430-7a76e848-1e5b-406a-b2b0-99869a031f3a.mp4" controls autoPlay></video>
              <br />
              <br />
              Harmony keeps track of the branches and commits you create allowing you to go back to a specific commit.
              <video width="100%" src="https://user-images.githubusercontent.com/78874117/194714002-f6ec20c5-c7cc-4144-85e1-0bdb65097b7d.mov" controls autoPlay></video>
              <br />
              Click on the commits with the Hash (not the Checkout commits) to visit that particular commit.
              <br />
              <br />
              <br />
              <strong>Harmony also has a basic support for Folders</strong> (does not support nested folders yet)
              <video width="100%" src="https://user-images.githubusercontent.com/78874117/194757713-771d1df7-3272-497b-9973-2e253da13e20.mp4" controls autoPlay></video>
              <br />
              Create one by simply creating a new file with this format: <strong>"DIRECTORY_NAME/FILE_NAME"</strong>.
              <br />
              {(action === HELP || open) && (
                <Button
                  sx={{
                    backgroundColor: '#d5a5f7',
                    color: '#fff',
                  }}
                  onClick={() => {
                    if (!!action) return setAction('');
                    return setOpen(false);
                  }}
                >
                  Close
                </Button>
              )}
            </DialogContentText>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Help;

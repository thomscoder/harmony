import { AiFillGithub as GithubIcon } from '@react-icons/all-files/ai/AiFillGithub';
import { FaQuestionCircle as QuestionIcon } from '@react-icons/all-files/fa/FaQuestionCircle';
import Popup from 'reactjs-popup';

const HomepageMisc = () => {
  return (
    <>
      <h1>Harmony ✨</h1>
      <Popup trigger={() => <button id="guide"><QuestionIcon size={19} /></button>} position="bottom right" closeOnDocumentClick>
      <span>
        Create and/or modify local files, on the fly!
        <br />
        Create/import multiple files, click a file to edit it
        <br />
        and jump between them
        <br />
        without losing changes.
        <strong>Save different "workspaces" <br/> by committing your changes and <br/>switching branches</strong>
      </span>
      </Popup>
      <div id="layer"></div>
      <div id="github">
        <a href="https://github.com/thomscoder/harmony" target="_blank">
          <GithubIcon size={20} />
        </a>
      </div>
    </>
  );
};

export default HomepageMisc;

import { AiFillGithub as GithubIcon } from '@react-icons/all-files/ai/AiFillGithub';
import { FaQuestionCircle as QuestionIcon } from '@react-icons/all-files/fa/FaQuestionCircle';
import ReactTooltip from 'react-tooltip';

const HomepageMisc = () => {
  return (
    <>
      <h1>Harmony ✨</h1>
      <a style={{ color: 'white' }} data-tip="custom show" data-event="click focus">
        <QuestionIcon size={19} />
      </a>
      <ReactTooltip place="bottom" globalEventOff="click">
        Create and/or modify local files, on the fly!
        <br />
        Create/import multiple files Click a file to edit it
        <br />
        and jump between them
        <br />
        without losing your changes.
      </ReactTooltip>
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

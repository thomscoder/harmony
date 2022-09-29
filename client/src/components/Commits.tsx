import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { virtualBranchState } from '../atoms/atoms';
import './styles/Commit.css';

const Commit = () => {
  const virtualBranch = useRecoilValue(virtualBranchState);

  const [commitMsg, setCommitMsg] = useState<string>();
  const [commits, setCommits] = useState();
  const inputCommitRef = useRef(null);
  useEffect(() => {
    console.log(commits);
  }, [commits]);
  return (
    <>
      <form
        className="commit-form"
        onSubmit={(e) => {
          e.preventDefault();
          // @ts-ignore
          setCommits(JSON.parse(virtualCommit(commitMsg)));
          (inputCommitRef.current! as HTMLInputElement).value = '';
        }}
      >
        <input disabled={!!virtualBranch === false} ref={inputCommitRef} type="text" placeholder="Commit message - Press Enter to submit" className="commit-msg-input" onChange={(e) => setCommitMsg(e.target.value)} />
      </form>
    </>
  );
};

export default Commit;

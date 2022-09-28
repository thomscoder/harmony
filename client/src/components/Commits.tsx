import { useEffect, useRef, useState } from "react"
import "./styles/Commit.css"

const Commit = () => {
    const [commitMsg, setCommitMsg] = useState<string>();
    const [commits, setCommits] = useState();
    const inputCommitRef = useRef(null);
    useEffect(() => {
        console.log(commits);
    }, [commits])
    return (
        <>
            <form className="commit-form" onSubmit={(e) => {
                e.preventDefault();
                    // @ts-ignore
                    setCommits(JSON.parse(virtualCommit(commitMsg)));
                    (inputCommitRef.current! as HTMLInputElement).value = '';
                    
            }}>
                <input ref={inputCommitRef} type="text" placeholder="Commit message - Press Enter to submit" className="commit-msg-input" onChange={(e) => setCommitMsg(e.target.value)}/>
            </form>
        </>
    )
}

export default Commit;
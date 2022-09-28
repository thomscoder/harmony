import { useRef, useState } from "react"
import "./Commit.css"

const Commit = () => {
    const [commitMsg, setCommitMsg] = useState<string>();
    const inputCommitRef = useRef(null);
    
    return (
        <>
            <form className="commit-form" onSubmit={(e) => {
                e.preventDefault();
                    // @ts-ignore
                    console.log(virtualCommit(commitMsg));
                    (inputCommitRef.current! as HTMLInputElement).value = '';
                    
            }}>
                <input ref={inputCommitRef} type="text" placeholder="Commit message - Press Enter to submit" className="commit-msg-input" onChange={(e) => setCommitMsg(e.target.value)}/>
            </form>
        </>
    )
}

export default Commit;
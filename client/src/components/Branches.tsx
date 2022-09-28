
import "./styles/Branches.css"
import { useEffect, useRef, useState } from 'react';

const Branches = ({changeFilesOnCheckout}: {changeFilesOnCheckout: any}) => {
    const [currentBranch, setCurrentBranch] = useState<string>('');
    const [branchName, setBranchName] = useState<string>('');
    const inputBranchRef = useRef(null);

    useEffect(() => {
        if (!!branchName) {
            // @ts-ignore
            changeFilesOnCheckout(getVirtualFiles().split(" "))
        }
    }, [currentBranch])
    const addBranchHandler = (e: any) => {
        e.preventDefault();
        // @ts-ignore
        setCurrentBranch(goToBranch(branchName));
    } 

    return (
        <>
            <div className="add-branches">
                <form onSubmit={addBranchHandler} className="branch-creation-form">
                    <input ref={inputBranchRef} name="branch-name" type="text" placeholder="Branch name - Press Enter to submit" className="branch-name-input" onChange={(e) => setBranchName(e.target.value)}/>
                    <span className="current-branch-name">{currentBranch}</span>
                </form>
            </div>
        </>
    )
}

export default Branches;
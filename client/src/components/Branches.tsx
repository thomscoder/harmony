
import "./styles/Branches.css"
import { useEffect, useRef, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { virtualFilesState, virtualBranchState } from '../atoms/atoms';

const Branches = () => {
    const setVirtualFiles = useSetRecoilState(virtualFilesState);
    const setVirtualBranch = useSetRecoilState(virtualBranchState);

    const [currentBranch, setCurrentBranch] = useState<string>('');
    const [branchName, setBranchName] = useState<string>('');
    const inputBranchRef = useRef(null);

    useEffect(() => {
        if (!!branchName) {
            // @ts-ignore
            setVirtualFiles(getVirtualFiles().split(" "));
            setVirtualBranch(branchName);
        }
    }, [currentBranch])
    const addBranchHandler = (e: any) => {
        e.preventDefault();
        (inputBranchRef.current! as HTMLInputElement).value = ''
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
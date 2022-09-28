import {AiOutlinePlusCircle as PlusSquare} from '@react-icons/all-files/ai/AiOutlinePlusCircle';
import "./styles/Branches.css"
import Select from 'react-select';
import { useEffect, useRef, useState } from 'react';

const Branches = () => {
    const [currentBranch, setCurrentBranch] = useState<string>('');

    useEffect(() => {
        // @ts-ignore
        setCurrentBranch(getCurrentBranch());
    }, [])
    const addBranchHandler = () => {

    } 
    const options = [
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' }
    ]
    return (
        <>
            <div className="add-branches">
                <PlusSquare size={35} onClick={addBranchHandler} />
                <p>{currentBranch}</p>
            </div>
        </>
    )
}

export default Branches;
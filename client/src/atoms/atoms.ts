import {atom} from 'recoil';

export const virtualFilesState = atom({
    key: 'virtualFilesState',
    default: [],
})

export const virtualBranchState = atom({
    key: 'virtualBranchState',
    default: '',
})
import { atom } from 'recoil';

export const virtualFilesState = atom({
  key: 'virtualFilesState',
  default: [],
});

export const virtualBranchState = atom({
  key: 'virtualBranchState',
  default: '',
});

export const virtualBranchesState = atom({
  key: 'virtualBranchesState',
  default: [],
});

export const createVirtualBranchMessageState = atom({
  key: 'createVirtualBranchMessageState',
  default: '',
});

export const actionState = atom({
  key: 'actionState',
  default: '',
});

export const freeModeDisabledState = atom({
  key: 'freeModeDisabledState',
  default: false,
});

export const gitFootPrintsState = atom({
  key: 'gitFootPrintsState',
  default: [
    {
      branch: 'master',
      commit: {},
    },
  ] as any,
});

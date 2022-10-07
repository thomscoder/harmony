import { CREATE_BRANCH, CREATE_COMMIT, CREATE_FILE, GRAPH_MODE, UPLOAD_FILE } from '../../../utils/texts';

export const options = new Map([
  [0, CREATE_FILE],
  [1, UPLOAD_FILE],
  [2, CREATE_BRANCH],
  [3, CREATE_COMMIT],
  [4, GRAPH_MODE],
]);

import { CREATE_BRANCH, CREATE_COMMIT, CREATE_FILE, HELP, UPLOAD_FILE } from './texts';

export const keyChecker = (key: string) => {
  switch (key) {
    case 'b':
      return CREATE_BRANCH;
    case 'c':
      return CREATE_COMMIT;
    case 'f':
      return CREATE_FILE;
    case 'u':
      return UPLOAD_FILE;
    case 'h':
      return HELP;
  }
};

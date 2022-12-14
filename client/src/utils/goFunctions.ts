export const createVirtualFilesWrapper = (filename: string, content?: string) =>
  // @ts-ignore
  createVirtualFiles(
    JSON.stringify({
      files: [
        {
          name: filename,
          content: !!content ? content : `Created at: ${new Date().toLocaleString()}`,
        },
      ],
    }),
  );

export const saveVirtualFilesWrapper = (openFile: string, content: string) =>
  // @ts-ignore
  saveVirtualFile(
    JSON.stringify({
      files: [
        {
          name: openFile,
          content: content,
        },
      ],
    }),
  );

// @ts-ignore
export const openVirtualFilesWrapper = (virtualFile: never) => openVirtualFile(virtualFile);

// @ts-ignore
export const getVirtualFilesWrapper = () => getVirtualFiles().split(' ');

// @ts-ignore
export const goToBranchWrapper = (branchName: string) => goToBranch(branchName).split(' ');

export const virtualCommitWrapper = (commitMsg: string) => {
  // @ts-ignore
  const commit = virtualCommit(commitMsg);
  try {
    return JSON.parse(commit);
  } catch (err) {
    return 'No file modifications found';
  }
};

// @ts-ignore
export const goToCommitWrapper = (hash: string) => goToCommit(hash);

export const exploreDirectoryWrapper = (filename: string) => {
  // @ts-ignore
  const filepath = `./${filename}/` + exploreDirectory(filename);
  return filepath.split(' ');
};

// @ts-ignore
export const isDirectoryWrapper = (filename: string) => isDirectory(filename);

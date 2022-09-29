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

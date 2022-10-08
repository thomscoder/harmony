type harmonyCommit = {
  hash?: string;
  message?: string;
};

export type gitFootPrintType = {
  branch: string;
  commit: harmonyCommit;
};

export type EditorProps = { text: string; save: any; close: any; filename: string };

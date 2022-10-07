type harmonyCommit = {
    hash?: string;
    message?: string;
}

export type gitFootPrintType = {
    branch: string;
    commit: harmonyCommit;
}
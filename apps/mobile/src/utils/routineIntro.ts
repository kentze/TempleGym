interface VisitInfo {
  // The app has already shown this account the open My Routine once
  seenBefore: boolean;
  folderCount: number;
  savedRoutineCount: number;
}

// True only for an account's very first visit, when nothing has been saved yet.
// That is the one time My Routine starts open so the empty message shows.
export function isFirstVisit({ seenBefore, folderCount, savedRoutineCount }: VisitInfo): boolean {
  return !seenBefore && folderCount === 0 && savedRoutineCount === 0;
}

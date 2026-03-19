export type StoredFile = {
  fileName: string; // original file name
  fileType: string;
  fileSize: number;
  downloadUrl: string;
};

export interface FileStorage {
  /**
   * Persist a file that was already received (e.g. by Multer's disk storage).
   * Infrastructure may define the final on-disk name and how URLs are built.
   */
  buildStoredFile(input: {
    originalName: string;
    mimeType: string;
    size: number;
    storedFileName: string;
  }): StoredFile;

  resolveStoredPath(storedFileName: string): string;
}


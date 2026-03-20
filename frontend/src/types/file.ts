export type UploadFileResponse = {
    id: number;
    originalFilename: string;
    downloadToken: string;
    downloadUrl: string;
    createdAt: string;
    expiresAt: string;
    passwordProtected: boolean;
  };
  
  export type PublicFileResponse = {
    originalFilename: string;
    mimeType: string;
    size: number;
    expiresAt: string;
    passwordProtected: boolean;
    expired: boolean;
  };
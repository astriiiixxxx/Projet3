export type UploadFileResponse = {
    id: number;
    originalFilename: string;
    downloadToken: string;
    downloadUrl: string;
    createdAt: string;
    expiresAt: string;
    passwordProtected: boolean;
};
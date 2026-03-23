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
  createdAt: string;
  expiresAt: string;
  expired: boolean;
  passwordProtected: boolean;
  downloadUrl: string;
};

export type FileHistoryResponse = {
  id: number;
  originalFilename: string;
  size: number;
  createdAt: string;
  expiresAt: string;
  expired: boolean;
  passwordProtected: boolean;
  downloadToken: string;
  downloadUrl: string;
};

export type ApiErrorResponse = {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
};
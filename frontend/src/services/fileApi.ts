import { apiClient } from "../api/axios";
import type { PublicFileResponse, UploadFileResponse } from "../types/file";

type UploadFileParams = {
  file: File;
  expirationDays?: number;
  password?: string;
};

export async function uploadFile(
  params: UploadFileParams
): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append("file", params.file);

  if (params.expirationDays !== undefined) {
    formData.append("expirationDays", String(params.expirationDays));
  }

  if (params.password) {
    formData.append("password", params.password);
  }

  const response = await apiClient.post<UploadFileResponse>("/files", formData);
  return response.data;
}

export async function getPublicFile(token: string): Promise<PublicFileResponse> {
  const response = await apiClient.get<PublicFileResponse>(
    `/files/public/${token}`
  );
  return response.data;
}
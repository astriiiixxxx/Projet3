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

export async function getPublicFile(
  token: string
): Promise<PublicFileResponse> {
  const response = await apiClient.get<PublicFileResponse>(
    `/files/public/${token}`
  );
  return response.data;
}

export async function downloadPublicFile(
  token: string,
  password?: string
): Promise<Blob> {
  const headers: Record<string, string> = {};

  if (password && password.trim()) {
    headers["X-File-Password"] = password;
  }

  const response = await apiClient.get(`/files/download/${token}`, {
    responseType: "blob",
    headers,
  });

  return response.data;
}
import { apiClient } from "../api/axios";
import type { UploadFileResponse } from "../types/file";

export async function uploadFile(params: {
    file: File;
    expirationDays?: number;
    password?: string;
}): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append("file", params.file);

    if (params.expirationDays) {
        formData.append("expirationDays", String(params.expirationDays));
    }

    if (params.password) {
        formData.append("password", params.password);
    }

    const response = await apiClient.post<UploadFileResponse>("/files", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
}
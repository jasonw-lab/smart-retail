import { fetchApi, ApiError } from '@/lib/api/client';
import type { FileInfo } from '../types/file';

const BASE_URL = '/api/proxy/api/v1/files';

function readCsrfCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

async function fetchCsrfToken(): Promise<string | null> {
  const cookieToken = readCsrfCookie();
  if (cookieToken) return cookieToken;

  try {
    const response = await fetch('/api/auth/csrf', { credentials: 'include' });
    if (!response.ok) return null;
    const data = (await response.json()) as { token?: string };
    return data.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Client Component専用のFile API
 *
 * fetchApi は FormData / Blob に対応していないため、
 * アップロードのみ生の fetch を使用します。
 */
export const fileApiClient = {
  /**
   * ファイルをアップロードする
   */
  upload: async (file: File): Promise<FileInfo> => {
    const formData = new FormData();
    formData.append('file', file);

    const csrfToken = await fetchCsrfToken();

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
      };
      throw new ApiError(
        errorData.error || `File upload failed: ${response.status}`,
        response.status,
        errorData.code
      );
    }

    return response.json() as Promise<FileInfo>;
  },

  /**
   * ファイルを削除する
   */
  delete: async (filePath: string): Promise<void> => {
    await fetchApi<void>(`${BASE_URL}?filePath=${encodeURIComponent(filePath)}`, {
      method: 'DELETE',
    });
  },
};

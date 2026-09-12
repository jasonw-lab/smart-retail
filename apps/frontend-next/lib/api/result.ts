export const API_SUCCESS_CODE = '00000';

export interface ApiResponse<T> {
  code: string;
  msg: string;
  data: T;
}

export class BackendApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'BackendApiError';
  }
}

export function statusFromApiCode(code: string, fallback = 400): number {
  if (code.startsWith('A')) return 401;
  if (code.startsWith('F')) return 403;
  if (code.startsWith('B')) return 404;
  if (code.startsWith('C')) return 409;
  return fallback;
}

export async function unwrapApiResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new BackendApiError(
      payload?.msg || `Backend API error: ${response.status} ${response.statusText}`,
      response.status,
      payload?.code
    );
  }

  if (payload.code !== API_SUCCESS_CODE) {
    throw new BackendApiError(
      payload.msg || 'Backend API error',
      statusFromApiCode(payload.code),
      payload.code
    );
  }

  return payload.data;
}

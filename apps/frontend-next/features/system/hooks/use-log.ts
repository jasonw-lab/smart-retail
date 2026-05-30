'use client';

import { useQuery } from '@tanstack/react-query';
import { getLogs } from '../lib/log-api.client';
import type { LogQuery } from '../types/log';

export function useLogs(params: LogQuery) {
  return useQuery({
    queryKey: ['logs', params],
    queryFn: () => getLogs(params),
  });
}

'use client';

import { useMutation } from '@tanstack/react-query';
import { heartbeatApiClient } from '../lib/heartbeat-api.client';
import type { SimpleHeartbeatPayload, HeartbeatPayload } from '../types/heartbeat';

/**
 * 簡易ハートビート送信Mutation
 */
export function useSendHeartbeat() {
  return useMutation({
    mutationFn: (data: SimpleHeartbeatPayload) => heartbeatApiClient.send(data),
  });
}

/**
 * 店舗統計付きハートビート送信Mutation
 */
export function useSendStoreHeartbeat() {
  return useMutation({
    mutationFn: (data: HeartbeatPayload) => heartbeatApiClient.sendStore(data),
  });
}

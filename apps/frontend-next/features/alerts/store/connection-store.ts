import { create } from 'zustand';

interface ConnectionState {
  isConnected: boolean;
  reconnectCount: number;
  setConnected: (connected: boolean) => void;
  setReconnectCount: (count: number) => void;
  incrementReconnectCount: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  isConnected: false,
  reconnectCount: 0,
  setConnected: (connected) => set({ isConnected: connected }),
  setReconnectCount: (count) => set({ reconnectCount: count }),
  incrementReconnectCount: () =>
    set((state) => ({ reconnectCount: state.reconnectCount + 1 })),
}));

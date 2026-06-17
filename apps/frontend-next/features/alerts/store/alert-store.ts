import { create } from 'zustand';
import type { Alert } from '../types/alert';

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  addAlert: (alert: Alert) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  setAlerts: (alerts: Alert[]) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  unreadCount: 0,

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 100), // 最新100件
      unreadCount: state.unreadCount + (alert.read ? 0 : 1),
    })),

  markAsRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
      unreadCount: Math.max(
        0,
        state.unreadCount -
          (state.alerts.find((a) => a.id === id && !a.read) ? 1 : 0)
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, read: true })),
      unreadCount: 0,
    })),

  clearAll: () => set({ alerts: [], unreadCount: 0 }),

  setAlerts: (alerts) =>
    set({
      alerts,
      unreadCount: alerts.filter((a) => !a.read).length,
    }),
}));

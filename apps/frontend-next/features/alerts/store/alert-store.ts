import { create } from 'zustand';
import type { Alert } from '../types/alert';

function countUnread(alerts: Alert[]): number {
  return alerts.filter((alert) => !alert.read).length;
}

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  addAlert: (alert: Alert) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  updateAlertStatus: (id: string, status: Alert['status']) => void;
  removeAlert: (id: string) => void;
  clearAll: () => void;
  setAlerts: (alerts: Alert[]) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  unreadCount: 0,

  addAlert: (alert) =>
    set((state) => {
      const withoutDuplicate = state.alerts.filter((item) => item.id !== alert.id);
      const alerts = [alert, ...withoutDuplicate].slice(0, 100);

      return {
        alerts,
        unreadCount: countUnread(alerts),
      };
    }),

  markAsRead: (id) =>
    set((state) => {
      const alerts = state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a));

      return {
        alerts,
        unreadCount: countUnread(alerts),
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, read: true })),
      unreadCount: 0,
    })),

  updateAlertStatus: (id, status) =>
    set((state) => {
      const alerts = state.alerts.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              read: status !== 'unread',
            }
          : a
      );

      return {
        alerts,
        unreadCount: countUnread(alerts),
      };
    }),

  removeAlert: (id) =>
    set((state) => {
      const alerts = state.alerts.filter((a) => a.id !== id);

      return {
        alerts,
        unreadCount: countUnread(alerts),
      };
    }),

  clearAll: () => set({ alerts: [], unreadCount: 0 }),

  setAlerts: (alerts) =>
    set({
      alerts,
      unreadCount: countUnread(alerts),
    }),
}));

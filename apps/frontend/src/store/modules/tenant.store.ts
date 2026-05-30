import { defineStore } from "pinia";
import { store } from "@/store";

/** テナント情報 */
export interface TenantInfo {
  /** テナントID */
  id: string;
  /** テナントコード */
  code: string;
  /** テナント名 */
  name: string;
}

interface TenantState {
  /** 現在のテナント */
  currentTenant: TenantInfo | null;
}

const TENANT_STORAGE_KEY = "tenant";

export const useTenantStore = defineStore("tenant", {
  state: (): TenantState => ({
    currentTenant: loadTenantFromStorage(),
  }),

  getters: {
    /** 現在のテナントID */
    tenantId: (state): string | null => state.currentTenant?.id ?? null,
    /** 現在のテナントコード */
    tenantCode: (state): string | null => state.currentTenant?.code ?? null,
    /** 現在のテナント名 */
    tenantName: (state): string | null => state.currentTenant?.name ?? null,
    /** テナントが設定されているか */
    hasTenant: (state): boolean => state.currentTenant !== null,
  },

  actions: {
    /** テナント設定 */
    setTenant(tenant: TenantInfo) {
      this.currentTenant = tenant;
      saveTenantToStorage(tenant);
    },

    /** テナントクリア */
    clearTenant() {
      this.currentTenant = null;
      localStorage.removeItem(TENANT_STORAGE_KEY);
    },

    /** テナント切り替え（管理者向け） */
    switchTenant(tenant: TenantInfo) {
      this.setTenant(tenant);
    },
  },
});

/** localStorageからテナント情報を復元 */
function loadTenantFromStorage(): TenantInfo | null {
  try {
    const stored = localStorage.getItem(TENANT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as TenantInfo;
    }
  } catch {
    // ignore parse error
  }
  return null;
}

/** localStorageにテナント情報を保存 */
function saveTenantToStorage(tenant: TenantInfo): void {
  localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(tenant));
}

/** Setup store外での使用用 */
export function useTenantStoreHook() {
  return useTenantStore(store);
}

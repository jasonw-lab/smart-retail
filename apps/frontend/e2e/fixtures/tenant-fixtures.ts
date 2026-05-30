/**
 * Multi-tenant E2E Test Fixtures
 * @author jason.w
 */

/** テナント情報 */
export interface Tenant {
  id: string;
  code: string;
  name: string;
}

/** テストテナント */
export const tenants: Record<string, Tenant> = {
  default: {
    id: "1",
    code: "DEFAULT",
    name: "Default Tenant",
  },
};

/** テストユーザー */
export const testUser = {
  username: "admin",
  password: "admin123",
  tenantId: "1",
};

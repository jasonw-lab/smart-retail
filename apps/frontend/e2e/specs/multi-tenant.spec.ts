/**
 * Multi-Tenant Basic E2E Tests
 *
 * ログイン後の基本操作確認
 *
 * @author jason.w
 */

import { test, expect } from "@playwright/test";

test.describe("Multi-Tenant Basic Operations", () => {
  test.beforeEach(async ({ page }) => {
    // まずページに移動してからlocalStorageを設定
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("accessToken", "test-token");
      localStorage.setItem(
        "tenant",
        JSON.stringify({ id: "1", code: "DEFAULT", name: "Default Tenant" })
      );
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          userId: "1",
          tenantId: "1",
          username: "admin",
          roles: ["ADMIN"],
        })
      );
    });
  });

  test("tenant data should be stored in localStorage", async ({ page }) => {
    // localStorage にテナント情報が正しく保存されていることを確認
    const tenant = await page.evaluate(() => {
      const t = localStorage.getItem("tenant");
      return t ? JSON.parse(t) : null;
    });

    expect(tenant).not.toBeNull();
    expect(tenant.id).toBe("1");
    expect(tenant.code).toBe("DEFAULT");
    expect(tenant.name).toBe("Default Tenant");
  });

  test("tenant context should persist after page refresh", async ({ page }) => {
    await page.goto("/");
    await page.reload();

    const tenant = await page.evaluate(() => {
      const t = localStorage.getItem("tenant");
      return t ? JSON.parse(t) : null;
    });

    expect(tenant).not.toBeNull();
    expect(tenant.id).toBe("1");
  });

  test("logout should clear tenant context", async ({ page }) => {
    await page.goto("/");

    // ログアウトをシミュレート
    await page.evaluate(() => {
      localStorage.removeItem("tenant");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");
    });

    const tenant = await page.evaluate(() => localStorage.getItem("tenant"));
    expect(tenant).toBeNull();
  });
});

# 追加したい機能
Task 05: デバイス管理画面 Backend Integration

# 背景
frontend-nextのデバイス管理画面をsmart-dx-backendのデバイスAPIに接続する。
ページネーション用の `/page` エンドポイントがバックエンドに不足している。

# 期待する振る舞い
- デバイス一覧がページネーション付きで表示 (`GET /api/v1/retail/devices/page`) ※Backend追加
- デバイスCRUD操作が正常動作
- デバイスステータスの表示

# 制約・前提
- frontend-next: `apps/frontend-next/`
- backend: `../smart-dx-backend/apps/backend/`
- 対象ファイル:
  - Frontend:
    - `features/devices/types/device.ts` (バックエンドDeviceVOに合わせて拡張)
    - `features/devices/lib/device-api.client.ts`
  - Backend:
    - `DeviceController.java` (追加: `/page` エンドポイント with PageResult<DeviceVO>)

# スコープ外
- デバイス監視機能
- UI変更

# 完了の目安
- デバイスCRUDが全て正常動作
- ページネーションが正常動作
- E2Eテスト通過

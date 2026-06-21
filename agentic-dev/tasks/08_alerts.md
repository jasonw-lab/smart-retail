# 追加したい機能
Task 08: アラート画面 Backend Integration

# 背景
frontend-nextのアラート画面をsmart-dx-backendのアラートAPIおよびWebSocketに接続する。

# 期待する振る舞い
- アラート一覧がREST APIで取得可能 (`GET /api/v1/retail/alerts`)
- WebSocket (STOMP) でリアルタイムアラート受信
- アラートの既読・確認操作
- アラート種別によるフィルタ

# 制約・前提
- frontend-next: `apps/frontend-next/`
- backend: `../smart-dx-backend/apps/backend/`
- 対象ファイル:
  - Frontend:
    - `features/alerts/lib/alert-api.client.ts` (新規作成)
    - `features/alerts/lib/alert-api.server.ts` (新規作成)
    - `features/alerts/types/alert.ts` (バックエンドAlert Entityと整合性確認)
    - `features/alerts/hooks/use-stomp.ts` (WebSocket接続確認)
- バックエンドAPIは変更不要（既存エンドポイント使用）

# スコープ外
- アラートルール設定
- 通知設定
- UI変更

# 完了の目安
- REST APIでアラート取得成功
- WebSocketでリアルタイム受信成功
- E2Eテスト通過

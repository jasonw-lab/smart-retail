# ADR-010: 認証付きBackend fetchのキャッシュ方針

## ステータス

Accepted (2026-07-10)

## 背景

Next.js の `fetch` キャッシュ挙動はバージョンによって前提が変わる。認証付きAPIレスポンスを暗黙に Data Cache へ保存すると、ユーザー別データの鮮度低下やトークン更新ごとのキャッシュ断片化が起きる。

## 決定

`lib/api/server.ts` の `fetchFromBackend()` は、呼び出し側が `cache` または `next` オプションを明示しない限り `cache: 'no-store'` を付与する。

認証付き業務データは原則 `no-store` とし、キャッシュしたいデータだけ呼び出し側で `next: { revalidate, tags }` を明示する。

Client Component のサーバー状態は TanStack Query の `invalidateQueries` を正とする。Server Component 起点で明示キャッシュを使う場合のみ、mutation 後に `revalidateTag` または `router.refresh()` を併用する。

## 影響

- 商品・店舗・在庫などの一覧はリロード時に古い Data Cache を読まない。
- `users/me` など認証・権限に関わるデータも暗黙キャッシュしない。
- Next.js メジャーバージョン更新時は、本ADRと `fetchFromBackend()` の挙動を再確認する。

## 変更履歴

| 日付       | 内容     |
| ---------- | -------- |
| 2026-07-10 | 初版作成 |

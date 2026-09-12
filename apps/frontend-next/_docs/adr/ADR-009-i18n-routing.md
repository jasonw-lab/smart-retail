# ADR-009: i18nルーティング設計

## ステータス

Accepted (2026-07-10)

## 背景

実装は `next-intl` と `app/[locale]` セグメントを採用している。ルーティング、middleware、リンク生成、E2E の URL 前提に影響する横断的な決定であるため、ADRとして明文化する。

## 決定

`next-intl` を採用し、ロケールは `ja` / `en`、デフォルトは `ja`、`localePrefix: 'as-needed'` とする。

App Router 配下は以下の構成を正とする。

```text
app/
  [locale]/
    (auth)/
      login/
    (dashboard)/
      products/
      stores/
      devices/
      inventory/
      transactions/
      alerts/
      system/
```

middleware は `next-intl` middleware と認証チェックを合成する。API Route と静的アセットは middleware の認証対象外とし、各 Route Handler 側で必要な検証を行う。

Client Component の画面遷移は `@/i18n/navigation` の `Link` / `useRouter` / `usePathname` を使う。`next/navigation` の `useSearchParams` と `notFound` はロケール非依存のため利用可とする。

## 影響

- 非デフォルトロケールでも画面遷移時に locale が維持される。
- ESLint の `no-restricted-imports` で `next/link` と `next/navigation` の `useRouter` / `usePathname` を禁止する。
- `data-testid` は翻訳に依存しないセレクタとして維持する。

## 変更履歴

| 日付       | 内容     |
| ---------- | -------- |
| 2026-07-10 | 初版作成 |

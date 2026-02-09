# Claude CLI 開発ガイドライン

## プロジェクト概要

**Smart Retail** - 小売業向け在庫・販売管理システム

| コンポーネント | パス | 技術スタック |
|--------------|------|-------------|
| Backend API | `backend/` | Java 17 + Spring Boot 3 + MyBatis Plus |
| Frontend UI | `frontend/` | React + TypeScript + Ant Design |

## 参照ドキュメント

- **プロジェクト固有ルール**: `AGENT.md`
- **要件定義**: `docs/architecture/design/smart-retail-requirements.md`
- **UI設計**: `docs/architecture/design/smart-retail-ui-design.md`
- **DB設計**: `docs/architecture/design/smart-retail-sql.md`
- **Issue管理**: `docs/issues/plan_issue.md`

## 変更可能範囲

下記ディレクトリは自由に変更可能:
- `backend/src/main/java/com/youlai/boot/modules/retail/`
- `backend/src/main/resources/mapper/retail/`
- `frontend/src/` (retail関連)

**上記以外を変更する場合は理由を確認してから実施**

## 実行ルール

### 自動実行
- 確認を求めず自律的に判断して進める
- 明示的な停止指示がない限り作業を継続
- エラー発生時は自律的に解決を試みる

### 確認が必要な操作
- ファイル削除
- ブランチ削除
- 破壊的なgit操作
- 他人のgit リポジトリへpush

## Rate Limit 対策

- 不要なAPI呼び出しを減らす
- 独立した操作は並列実行
- ファイル読み込みは必要な範囲を一度に取得

## Git ルール

- **コミット履歴に「CLAUDE」を残さない**
- **committer/author に「CLAUDE」を含めない**
- コミットメッセージ: Conventional Commits形式
- PRは `develop` ブランチへ提出

## コミュニケーション

- 簡潔で明確な報告
- 技術的詳細は必要な場合のみ
- 絵文字は使用しない

---

**最終更新**: 2026年2月9日

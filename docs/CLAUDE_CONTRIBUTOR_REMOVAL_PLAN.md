# Claude Contributors 削除計画

**作成日**: 2026-01-31  
**ステータス**: 提案中  
**問題**: 4つのコミットに `Co-Authored-By: Claude Sonnet 4.5` が含まれており、GitHub Contributors に表示される

---

## 問題の詳細

### 影響を受けるコミット

以下の4つのコミットに Claude Sonnet 4.5 が Co-Author として記載されています：

| コミット | タイトル | Author |
|---------|---------|--------|
| `54f74b1` | fix(product): APIレスポンス構造の修正 | jason.w |
| `fe0cdfd` | refactor(dashboard): 未実装機能のセクションを非表示化 | jason.w |
| `2cc53a9` | feat(dashboard): バックエンドAPIとの連携実装 | jason.w |
| `23aaebd` | docs: PR作成フローをdevelopブランチベースに更新 | jason.w |

---

## 解決策の比較

### オプション1: Git History の書き換え（完全な削除）

**手順:**
```bash
# 1. バックアップブランチを作成
git branch backup-before-rewrite

# 2. インタラクティブリベースで対象コミットを編集
git rebase -i <最初の対象コミットの親>

# 3. 各コミットで "edit" を選択し、コミットメッセージから Co-Authored-By を削除
git commit --amend
# Co-Authored-By 行を削除
git rebase --continue

# 4. 強制プッシュ（必須）
git push --force-with-lease
```

**メリット:**
- Claude が完全に Contributors から削除される
- クリーンな履歴になる

**デメリット:**
- **force push が必要**（環境制限により不可能）
- 全開発者がリポジトリを再クローンする必要がある
- 既存の PR、Issue リンクが壊れる可能性
- リスクが高い

**実現可能性**: ❌ **不可** - force push が許可されていない

---

### オプション2: .mailmap ファイルの作成（表示の変更）

**手順:**
```bash
# .mailmap ファイルを作成
cat > .mailmap << 'EOF'
# Claude Sonnet 4.5 のメールアドレスをマッピング
# ただし、GitHub Contributors には効果なし
EOF

git add .mailmap
git commit -m "chore: add .mailmap to manage contributor mappings"
```

**メリット:**
- git history を変更しない
- 一部の git コマンドでの表示が変わる

**デメリット:**
- **GitHub の Contributors ページには影響しない**
- 問題の根本的な解決にならない

**実現可能性**: ⚠️ **部分的** - GitHub Contributors には効果なし

---

### オプション3: 新しいブランチ/リポジトリで再構築（完全なリセット）

**手順:**
```bash
# 1. クリーンな履歴で新しいブランチを作成
git checkout --orphan clean-history

# 2. 最新のコードをコミット
git add .
git commit -m "chore: clean repository initialization"

# 3. 古いブランチをリネーム
git branch -m develop develop-old

# 4. 新しいブランチを develop にリネーム
git branch -m clean-history develop

# 5. 強制プッシュ
git push --force origin develop
```

**メリット:**
- Claude が Contributors から完全に削除される
- シンプルな履歴になる

**デメリット:**
- **すべての git 履歴が失われる**
- force push が必要
- 非常に破壊的

**実現可能性**: ❌ **非推奨** - 履歴の完全な喪失

---

### オプション4: GitHub API を使用（調査中）

GitHub API を使用して Contributors の表示を制御できるか調査が必要です。

**実現可能性**: ❓ **要調査**

---

### ★ オプション5: 今後の対応方針の確立（推奨）★

**手順:**
1. 既存の4つのコミットはそのまま保持（履歴として）
2. 今後のコミットでは Co-Authored-By: Claude を使用しない
3. CLAUDE.md に開発ガイドラインとして明記
4. コミットフックを設定して Co-Authored-By の自動削除

```bash
# pre-commit フックの作成
cat > .git/hooks/prepare-commit-msg << 'EOF'
#!/bin/sh
# Remove Claude co-author lines from commit messages
sed -i '/Co-Authored-By.*Claude/d' "$1"
EOF

chmod +x .git/hooks/prepare-commit-msg
```

**メリット:**
- リスクなし
- 履歴を保持
- 今後の新規コミットには Claude が表示されない
- 実装が簡単

**デメリット:**
- 既存の4つのコミットの Co-Author は残る
- GitHub Contributors に Claude が表示され続ける（過去の貢献として）

**実現可能性**: ✅ **推奨** - 最もリスクが低く実現可能

---

## 推奨アクション

現在の環境制限（force push 不可）を考慮すると、**オプション5（今後の対応方針の確立）**を推奨します。

### 実装手順

1. **CLAUDE.md にコミットガイドラインを追加**
   ```markdown
   ## コミットメッセージ規約
   - Co-Authored-By タグは使用しない
   - AI アシスタントの貢献は README や ACKNOWLEDGMENTS に記載
   ```

2. **今後のコミットで Co-Authored-By を使用しない**
   - チーム全体に周知
   - コミット前に確認

3. **（オプション）pre-commit フックを設定**
   - 自動的に Co-Authored-By 行を削除
   - ローカル環境でのみ有効

### 将来的な対応

もし将来的に Claude を完全に削除する必要が生じた場合：
1. チーム全体での合意形成
2. メンテナンス期間を設定
3. git history の書き換えを実施（オプション1）
4. 全開発者への通知

---

## 結論

**質問への回答**: "Contributors から claude Claude 削除は可能か"

**回答**: 
- **技術的には可能**だが、force push が必要
- **現在の環境では実現不可**（force push が許可されていない）
- **推奨対応**: 既存の4つのコミットはそのまま保持し、今後の新規コミットで Co-Authored-By を使用しないようにする

---

**作成者**: GitHub Copilot Agent  
**最終更新**: 2026-01-31

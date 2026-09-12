"""共通テンプレートから workflow レビュー対応 HTML を生成する。"""
from html import escape
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path.home() / 'ai-rules/assets'
OUT = ROOT / '_review/review_0910_workflow.claude.html'
source = (ROOT / '_review/review_0910_workflow.claude.md').read_text()
response = source.split('## 6. Codex 対応記録', 1)[1]
rows = []
for line in response.splitlines():
    if re.match(r'\| \d+ ', line):
        rows.append([part.strip() for part in line.strip('|').split('|')])
assert len(rows) == 10

def card(path, before=None, after=None, language='markdown'):
    body = '<div class="file-card-note">コード抜粋省略（文書整合・対応記録または生成補助。変更範囲は対応表を参照）。</div>'
    if before is not None:
        body = ''.join(f'<p>{label}</p><pre><code class="language-{language}">{escape(code)}</code></pre>' for label, code in [('Before', before), ('After', after)])
    return f'<div class="file-card"><div class="file-card-head"><span>{escape(path)}</span></div>{body}</div>'

issues = []
for i, row in enumerate(rows, 1):
    title, severity, status, detail = row
    files = card('_docs/workflow.md')
    if i == 1:
        files = ''.join(card(path, 'pull_request:\n  branches: [main, develop]', "pull_request:\n  branches: ['**']", 'yaml') for path in ['.github/workflows/ci.yml', '.github/workflows/pr-check.yml'])
    elif i == 3:
        files = card('_docs/workflow.md', '担当・承認点なし。最後に全件 E2E と done 更新。', 'H1 要件 → AI 設計レビュー → 必要時 H2 設計方針\n→ AI 実装・独立レビュー・CI・逐次統合 → H3 最終受入\n→ AI が証跡を確認し done 更新')
    elif i == 8:
        files = card('AGENTS.md')
    issues.append(f'''<h2 class="issue-title" id="response-{i}">{escape(title)}</h2>
<p class="block-label">指摘内容</p><p>{escape(title)}（{escape(severity)}）</p>
<p class="block-label">対応理由</p><p>人間の介入を抑えながら、別 AI が根拠と検証結果を確認できるようにする。</p>
<p class="block-label">対応方法</p><p>{escape(status)}：{escape(detail)}</p>
<p class="block-label">主要なコード変更</p>{files}''')

checks = response.split('### 検証結果', 1)[-1] if '### 検証結果' in response else '検証結果は Markdown 正本の対応記録を参照。'
category1 = '<section class="category-section" id="cat-1" data-category="指摘への対応"><div class="category-heading"><span>01</span><h2>指摘への対応</h2></div>' + ''.join(issues) + '</section>'
category2 = '''<section class="category-section" id="cat-2" data-category="検証と残課題" hidden><div class="category-heading"><span>02</span><h2>検証と残課題</h2></div>
<h2 class="issue-title" id="verification">検証結果と適用範囲</h2><p>ローカルの文書・CI 設定を修正。GitHub 保護設定、自動マージ、他 repo の CI、別モデルによる再承認は今回未確認。</p>'''
category2 += f'<pre><code class="language-markdown">{escape(checks.strip())}</code></pre>'
category2 += '<h2 class="issue-title" id="artifacts">対応記録と生成ファイル</h2>'
for path in ['_review/review_0910_workflow.claude.md', '_review/review_0910_workflow.claude.html', '_scripts/build_workflow_review.py']:
    category2 += card(path)
category2 += '</section>'
html = (ASSETS / 'learning-doc.template.html').read_text()
html = re.sub(r'<section class="category-section" id="cat-1".*?</section>', lambda _: category1, html, flags=re.S)
html = re.sub(r'<section class="category-section" id="cat-2".*?</section>', lambda _: category2, html, flags=re.S)
values = {'TITLE': 'workflow レビュー対応', 'DESCRIPTION': 'AI 駆動開発フローの指摘10項目への対応', 'MARK': 'WF', 'BRAND': '開発フロー', 'CATEGORY_1': '指摘への対応', 'CATEGORY_2': '検証と残課題', 'SOURCE_MD': 'review_0910_workflow.claude.md', 'EYEBROW': '2026/09/10 · codex', 'HEADING': '人間の確認を3点に集約', 'LEAD': '要件・設計方針・最終受入を人間が確認し、実装・独立レビュー・検証・記録更新を AI が進める。', 'STAT_LABEL_1': '対応項目', 'STAT_VALUE_1': '10', 'STAT_LABEL_2': '人間の確認', 'STAT_VALUE_2': '原則3点'}
for key, value in values.items():
    html = html.replace(f'__{key}__', escape(value))
OUT.write_text(html)
subprocess.run(['python3', str(ASSETS / 'build-learning-doc.py'), '--sync', str(OUT)], check=True)
subprocess.run(['python3', str(ASSETS / 'build-learning-doc.py'), '--check', str(OUT)], check=True)

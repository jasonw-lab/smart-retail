#!/usr/bin/env python3
"""_docs/plan/plan_0906_features.md の「作業状況」表を HTML ビューへ反映する。

正本は Markdown 側の表だけ。HTML はこのスクリプトが書き換える生成物として扱う。
書き換えるのは本文中のアンカーで囲まれたブロックのみで、
`<style>` / `<script>` には触れない。

  python3 _scripts/build_plan_html.py --sync    作業状況を HTML へ反映
  python3 _scripts/build_plan_html.py --check   表記ゆれ・記入漏れを検出
"""

import argparse
import html
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MD = os.path.join(ROOT, '_docs/plan/plan_0906_features.md')
HTML = os.path.join(ROOT, '_docs/plan/plan_0906_features.html')

# 状態は5値。表示順は進行順に対応する。
STATUSES = ['未着手', '着手中', 'レビュー待ち', '完了', '保留']

# HTML 側のバッジ種別。情報の区別を色だけに頼らないよう、ラベルは常に文字で出す。
BADGE_CLASS = {
    '未着手': 'badge-outline',
    '着手中': 'badge-default',
    'レビュー待ち': 'badge-outline',
    '完了': 'badge-secondary',
    '保留': 'badge-default',
}

# 「いま着手中」カードで使い分ける
CALLOUT_CLASS = {
    '着手中': 'callout-primary',
    'レビュー待ち': 'callout-primary',
    '保留': 'callout-danger',
}

DATE_RE = re.compile(r'^\d{4}-\d{2}-\d{2}$')
PROGRESS_RE = re.compile(r'^(\d+)/(\d+)$')

# 依存欄の範囲指定（U5〜U13 / U5-U13）と個別指定（U4, U5）の両方を拾う
DEP_RANGE_RE = re.compile(r'U(\d+)[〜~\-]U(\d+)')
DEP_UNIT_RE = re.compile(r'U\d+')


class PlanError(Exception):
    pass


def split_row(line):
    return [c.strip() for c in line.strip().strip('|').split('|')]


def read_section_table(md, heading):
    """`## <heading>` 直下にある最初のテーブルの行を返す。"""
    m = re.search(r'^## %s\s*$' % re.escape(heading), md, re.M)
    if not m:
        raise PlanError('見出し "## %s" が見つからない' % heading)
    rest = md[m.end():]
    stop = re.search(r'^## ', rest, re.M)
    if stop:
        rest = rest[: stop.start()]

    rows, in_table = [], False
    for line in rest.splitlines():
        if line.startswith('|'):
            cells = split_row(line)
            if set(''.join(cells)) <= set('-: '):  # 区切り行
                in_table = True
                continue
            if in_table:
                rows.append(cells)
            else:
                header = cells  # noqa: F841  ヘッダ行は読み飛ばす
        elif in_table and rows:
            break
    if not rows:
        raise PlanError('"## %s" の下にテーブルが無い' % heading)
    return rows


def load_plan():
    md = open(MD, encoding='utf-8').read()

    units = {}
    order = []
    # ユニット一覧の列構成: # | ユニット | 種別 | 元版 | 主対象 | 依存
    for cells in read_section_table(md, 'ユニット一覧'):
        uid = cells[0]
        units[uid] = {
            'id': uid,
            'name': cells[1],
            'kind': cells[2],
            'origin': cells[3],
            'target': cells[4],
            'dep': cells[5],
        }
        order.append(uid)

    for cells in read_section_table(md, '作業状況'):
        uid = cells[0]
        if uid not in units:
            raise PlanError('作業状況に未定義のユニットがある: %s' % uid)
        units[uid].update(
            status=cells[1],
            progress=cells[2] or '-',
            updated=cells[3] or '-',
            note=cells[4] if len(cells) > 4 else '',
        )

    missing = [u for u in order if 'status' not in units[u]]
    if missing:
        raise PlanError('作業状況に行が無いユニット: %s' % ', '.join(missing))

    return [units[u] for u in order]


def expand_deps(dep):
    """依存欄をユニット ID のリストへ展開する。

    `U5〜U13` / `U5-U13` のような範囲指定は U5..U13 へ展開し、
    `U4, U5` のような個別指定はそのまま拾う。両者の混在も可。
    """
    ids = []
    for m in DEP_RANGE_RE.finditer(dep):
        ids.extend('U%d' % i for i in range(int(m.group(1)), int(m.group(2)) + 1))
    rest = DEP_RANGE_RE.sub(' ', dep)
    ids.extend(DEP_UNIT_RE.findall(rest))
    return sorted(set(ids), key=lambda s: int(s[1:]))


def validate(plan):
    errors = []
    for u in plan:
        if u['status'] not in STATUSES:
            errors.append('%s: 状態 "%s" は定義外（%s のいずれか）' % (u['id'], u['status'], ' / '.join(STATUSES)))
        if u['progress'] != '-':
            m = PROGRESS_RE.match(u['progress'])
            if not m:
                errors.append('%s: 進捗 "%s" は "済/全" 形式か "-"' % (u['id'], u['progress']))
            elif int(m.group(1)) > int(m.group(2)):
                errors.append('%s: 進捗 "%s" は分子が分母を超えている' % (u['id'], u['progress']))
        if u['updated'] != '-' and not DATE_RE.match(u['updated']):
            errors.append('%s: 更新日 "%s" は YYYY-MM-DD か "-"' % (u['id'], u['updated']))
        if u['status'] != '未着手' and u['updated'] == '-':
            errors.append('%s: 状態が "%s" なのに更新日が空' % (u['id'], u['status']))
        if u['status'] == '保留' and not u['note']:
            errors.append('%s: 保留はメモにブロック理由が必須' % u['id'])
        if u['status'] == '完了' and u['progress'] != '-':
            m = PROGRESS_RE.match(u['progress'])
            if m and m.group(1) != m.group(2):
                errors.append('%s: 完了なのに進捗が %s' % (u['id'], u['progress']))

    active = [u['id'] for u in plan if u['status'] == '着手中']
    if len(active) > 1:
        errors.append('同時に着手中のユニットが複数ある: %s（1つまで）' % ', '.join(active))

    done = {u['id'] for u in plan if u['status'] == '完了'}
    for u in plan:
        if u['status'] in ('着手中', 'レビュー待ち', '完了') and u['dep'] != '-':
            deps = expand_deps(u['dep'])
            pending = [d for d in deps if d not in done]
            if pending:
                errors.append('%s: 依存 %s が未完了のまま状態が "%s"' % (u['id'], ', '.join(pending), u['status']))
    return errors


def e(text):
    return html.escape(text, quote=False)


def rich(text):
    """Markdown セル内の `code` を <code> に起こす。escape 後に置換して二重escapeを避ける。"""
    return re.sub(r'`([^`]+)`', r'<code>\1</code>', e(text))


def render_stats(plan):
    done = sum(1 for u in plan if u['status'] == '完了')
    active = sum(1 for u in plan if u['status'] in ('着手中', 'レビュー待ち'))
    blocked = sum(1 for u in plan if u['status'] == '保留')
    rest = len(plan) - done - active - blocked

    cells = [('完了', '%d / %d' % (done, len(plan))), ('進行中', str(active))]
    cells.append(('保留', str(blocked)) if blocked else ('残り', str(rest)))
    return '\n'.join(
        '            <div>\n              <dt>%s</dt>\n              <dd>%s</dd>\n            </div>' % (k, v)
        for k, v in cells
    )


def render_current(plan):
    """いま手を動かしているユニットだけを抜き出したカード。"""
    focus = [u for u in plan if u['status'] in ('保留', '着手中', 'レビュー待ち')]
    if not focus:
        nxt = next((u for u in plan if u['status'] == '未着手'), None)
        body = (
            '次に着手するのは <strong>%s %s</strong>（%s）。' % (e(nxt['id']), e(nxt['name']), e(nxt['kind']))
            if nxt
            else 'すべてのユニットが完了しています。'
        )
        return (
            '          <div class="callout callout-primary">\n'
            '            <h4>いま着手中のユニットはありません</h4>\n'
            '            <p>%s</p>\n'
            '          </div>' % body
        )

    out = []
    for u in focus:
        cls = CALLOUT_CLASS.get(u['status'], 'callout-primary')
        progress = '' if u['progress'] == '-' else '（%s）' % e(u['progress'])
        note = rich(u['note']) if u['note'] else 'メモ未記入'
        out.append(
            '          <div class="callout %s">\n'
            '            <h4>%s %s ｜ %s%s</h4>\n'
            '            <p>%s</p>\n'
            '            <p><small>対象: %s ／ 依存: %s ／ 更新: %s</small></p>\n'
            '          </div>'
            % (cls, e(u['id']), e(u['name']), e(u['status']), progress, note, rich(u['target']), e(u['dep']), e(u['updated']))
        )
    return '\n'.join(out)


def render_table(plan):
    rows = []
    for u in plan:
        rows.append(
            '                <tr>\n'
            '                  <td>%s</td>\n'
            '                  <td>%s</td>\n'
            '                  <td>%s</td>\n'
            '                  <td>%s</td>\n'
            '                  <td><span class="badge %s">%s</span></td>\n'
            '                  <td>%s</td>\n'
            '                  <td>%s</td>\n'
            '                  <td>%s</td>\n'
            '                </tr>'
            % (
                e(u['id']),
                e(u['name']),
                e(u['kind']),
                e(u['dep']),
                BADGE_CLASS[u['status']],
                e(u['status']),
                e(u['progress']),
                e(u['updated']),
                rich(u['note']),
            )
        )
    return '\n'.join(rows)


def render_badge(u):
    progress = '' if u['progress'] == '-' else ' %s' % u['progress']
    return '<span class="badge %s">%s%s</span>' % (BADGE_CLASS[u['status']], e(u['status']), e(progress))


def render_group_badge(plan, ids):
    members = [u for u in plan if u['id'] in ids]
    done = sum(1 for u in members if u['status'] == '完了')
    active = next((u for u in members if u['status'] in ('着手中', 'レビュー待ち', '保留')), None)
    if active:
        return '<span class="badge %s">%s %s（%d/%d 完了）</span>' % (
            BADGE_CLASS[active['status']],
            e(active['id']),
            e(active['status']),
            done,
            len(members),
        )
    status = '完了' if done == len(members) else '未着手'
    return '<span class="badge %s">%d/%d 完了</span>' % (BADGE_CLASS[status], done, len(members))


def block_pattern(name):
    return re.compile(
        re.escape('<!-- %s -->' % name) + r'(.*?)' + re.escape('<!-- /%s -->' % name), re.S
    )


def replace_block(doc, name, body):
    m = block_pattern(name).search(doc)
    if not m:
        raise PlanError('アンカー <!-- %s --> ... <!-- /%s --> が HTML に無い' % (name, name))
    return doc[: m.start()] + '<!-- %s -->\n%s\n<!-- /%s -->' % (name, body, name) + doc[m.end():]


def extract_block(doc, name):
    m = block_pattern(name).search(doc)
    if not m:
        raise PlanError('アンカー <!-- %s --> ... <!-- /%s --> が HTML に無い' % (name, name))
    return m.group(1)


def normalize(fragment):
    """prettier の折り返し差を無視して中身だけを比べる。

    prettier は閉じタグを `</span\\n  >` のように折ることがあるので、
    タグ内の改行・タグ間の空白をすべて畳んでから比較する。
    """
    s = re.sub(r'\s+', ' ', fragment)
    s = re.sub(r'\s+>', '>', s)
    s = re.sub(r'>\s+<', '><', s)
    return s.strip()


def blocks_for(plan, doc):
    """(アンカー名, 期待する中身) の一覧。sync と check で同じ定義を使う。"""
    yield 'PLAN:STATS', render_stats(plan)
    yield 'PLAN:CURRENT', render_current(plan)
    yield 'PLAN:TABLE', render_table(plan)

    by_id = {u['id']: u for u in plan}
    for anchor in sorted(set(re.findall(r'<!-- PLAN:BADGE:([^ ]+) -->', doc))):
        m = re.fullmatch(r'U(\d+)-U(\d+)', anchor)
        if m:
            ids = ['U%d' % i for i in range(int(m.group(1)), int(m.group(2)) + 1)]
            badge = render_group_badge(plan, ids)
        elif anchor in by_id:
            badge = render_badge(by_id[anchor])
        else:
            raise PlanError('アンカー PLAN:BADGE:%s に対応するユニットが無い' % anchor)
        yield 'PLAN:BADGE:%s' % anchor, badge


def check_synced(plan):
    """HTML が作業状況表の内容と一致しているかを見る（--sync のかけ忘れ検出）。"""
    doc = open(HTML, encoding='utf-8').read()
    stale = []
    for name, body in blocks_for(plan, doc):
        if normalize(extract_block(doc, name)) != normalize(body):
            stale.append(name)
    return stale


def sync(plan):
    doc = open(HTML, encoding='utf-8').read()
    for name, body in blocks_for(plan, doc):
        doc = replace_block(doc, name, body)
    open(HTML, 'w', encoding='utf-8').write(doc)
    format_html()


def format_html():
    """生成直後は整形が崩れるので prettier をかける。未導入なら黙って飛ばす。"""
    try:
        subprocess.run(
            ['npx', '--no-install', 'prettier', '--write', os.path.relpath(HTML, ROOT)],
            cwd=ROOT,
            check=True,
            capture_output=True,
        )
    except (OSError, subprocess.CalledProcessError):
        print('  (prettier をかけられなかったので整形は手動で行うこと)')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--sync', action='store_true', help='作業状況を HTML へ反映する')
    ap.add_argument('--check', action='store_true', help='表記ゆれ・記入漏れを検出する')
    args = ap.parse_args()
    if not (args.sync or args.check):
        ap.print_help()
        return 2

    try:
        plan = load_plan()
    except PlanError as err:
        print('NG %s' % err)
        return 1

    errors = validate(plan)
    if errors:
        for line in errors:
            print('NG %s' % line)
        return 1

    counts = {s: sum(1 for u in plan if u['status'] == s) for s in STATUSES}
    summary = ' '.join('%s=%d' % (s, counts[s]) for s in STATUSES if counts[s])

    if args.sync:
        try:
            sync(plan)
        except PlanError as err:
            print('NG %s' % err)
            return 1
        print('synced %s (%s)' % (os.path.relpath(HTML, ROOT), summary))
        return 0

    try:
        stale = check_synced(plan)
    except PlanError as err:
        print('NG %s' % err)
        return 1
    if stale:
        print('NG HTML が作業状況表と食い違っている: %s' % ', '.join(stale))
        print('   `python3 _scripts/build_plan_html.py --sync` を実行してコミットに含めること')
        return 1

    print('OK %d ユニット (%s) / HTML 同期済み' % (len(plan), summary))
    return 0


if __name__ == '__main__':
    sys.exit(main())

/**
 * E2E テストケース一覧（Excel / Markdown）を spec のメタ情報から生成する
 *
 *   pnpm e2e:cases          一覧を生成（e2e/results.json に実行結果があれば Excel に反映）
 *   pnpm e2e:cases:check    メタ情報の記入漏れと md の再生成し忘れを検出（ファイルは書き換えない）
 *
 * 正本は各 spec の caseMeta()（e2e/fixtures/case-meta.ts）。一覧ファイルは直接編集しない。
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import ExcelJS from 'exceljs';
import {
  PERSPECTIVES,
  PRIORITIES,
  SCREENS,
  type Perspective,
  type Priority,
  type Screen,
} from '@/e2e/fixtures/case-meta';

const RESULTS_PATH = 'e2e/results.json';
const MD_PATH = '_docs/testing/e2e-test-cases.md';
const XLSX_PATH = '_docs/testing/e2e-test-cases.xlsx';

type RunResult = '成功' | '失敗' | '不安定' | 'スキップ' | '未実行';

interface TestCase {
  id: string;
  screen: Screen;
  priority: Priority;
  perspectives: Perspective[];
  title: string;
  preconditions: string[];
  steps: string[];
  expected: string[];
  note: string;
  implemented: boolean;
  file: string;
  line: number;
  result: RunResult;
}

// Playwright JSON レポーターの必要な部分だけ
interface JsonAnnotation {
  type: string;
  description?: string;
}
interface JsonSpec {
  title: string;
  file: string;
  line: number;
  tags: string[];
  tests: { annotations: JsonAnnotation[]; status: string }[];
}
interface JsonSuite {
  title: string;
  specs?: JsonSpec[];
  suites?: JsonSuite[];
}
interface JsonReport {
  suites: JsonSuite[];
  errors: { message?: string }[];
  stats?: { startTime?: string; expected?: number; unexpected?: number; flaky?: number };
}

const ID_PATTERN = /^[A-Z0-9]+-\d{3}$/;
const PRIORITY_TAGS: Record<string, Priority> = { p0: 'P0', p1: 'P1', p2: 'P2' };

function walkSpecs(suites: JsonSuite[], visit: (spec: JsonSpec, describePath: string[]) => void) {
  const walk = (suite: JsonSuite, describePath: string[]) => {
    suite.specs?.forEach((spec) => visit(spec, describePath));
    suite.suites?.forEach((child) => walk(child, [...describePath, child.title]));
  };
  // 最上位の suite はファイル単位なので describe パスに含めない
  suites.forEach((fileSuite) => walk(fileSuite, []));
}

function listTests(): JsonReport {
  const stdout = execFileSync('pnpm', ['exec', 'playwright', 'test', '--list', '--reporter=json'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const report = JSON.parse(stdout) as JsonReport;
  if (report.errors.length > 0) {
    throw new Error(report.errors.map((e) => e.message).join('\n'));
  }
  return report;
}

function loadResults(): { runAt: string | null; byKey: Map<string, RunResult> } {
  const byKey = new Map<string, RunResult>();
  if (!fs.existsSync(RESULTS_PATH)) return { runAt: null, byKey };

  const report = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8')) as JsonReport;
  const stats = report.stats ?? {};
  // --list の出力は全件 skipped になるため、実行結果として扱わない
  if ((stats.expected ?? 0) + (stats.unexpected ?? 0) + (stats.flaky ?? 0) === 0) {
    return { runAt: null, byKey };
  }
  const statusMap: Record<string, RunResult> = {
    expected: '成功',
    unexpected: '失敗',
    flaky: '不安定',
    skipped: 'スキップ',
  };
  walkSpecs(report.suites, (spec, describePath) => {
    const status = spec.tests[0]?.status ?? '';
    byKey.set(specKey(spec, describePath), statusMap[status] ?? '未実行');
  });
  return { runAt: stats.startTime ?? null, byKey };
}

function specKey(spec: JsonSpec, describePath: string[]) {
  return [spec.file, ...describePath, spec.title].join(' › ');
}

function buildCases(report: JsonReport, results: Map<string, RunResult>) {
  const cases: TestCase[] = [];
  const errors: string[] = [];
  const seenIds = new Map<string, string>();

  walkSpecs(report.suites, (spec, describePath) => {
    const where = `${spec.file}:${spec.line} 「${spec.title}」`;
    const annotations = spec.tests[0]?.annotations ?? [];
    const texts = (type: string) =>
      annotations.filter((a) => a.type === type && a.description).map((a) => a.description!);

    const ids = spec.tags.filter((t) => ID_PATTERN.test(t));
    const priorities = spec.tags.filter((t) => t in PRIORITY_TAGS).map((t) => PRIORITY_TAGS[t]!);
    const perspectives = spec.tags.filter((t): t is Perspective => t in PERSPECTIVES);
    const unknownTags = spec.tags.filter(
      (t) => !ID_PATTERN.test(t) && !(t in PRIORITY_TAGS) && !(t in PERSPECTIVES)
    );
    const screen = texts('screen')[0];
    const steps = texts('step');
    const expected = texts('expected');

    const problems: string[] = [];
    if (ids.length !== 1) problems.push('ID タグが1つではない');
    if (priorities.length !== 1) problems.push('優先度タグが1つではない');
    if (perspectives.length === 0) problems.push('観点タグが無い');
    if (unknownTags.length > 0) problems.push(`未定義のタグ: ${unknownTags.join(', ')}`);
    if (!screen || !(SCREENS as readonly string[]).includes(screen)) problems.push('画面が未定義');
    if (steps.length === 0) problems.push('手順が無い');
    if (expected.length === 0) problems.push('期待結果が無い');
    const id = ids[0];
    if (id && seenIds.has(id)) problems.push(`ID ${id} が重複（${seenIds.get(id)}）`);
    if (problems.length > 0) {
      errors.push(`${where}: ${problems.join(' / ')}`);
      return;
    }
    seenIds.set(id!, where);

    const implemented = !annotations.some((a) => a.type === 'fixme');
    cases.push({
      id: id!,
      screen: screen as Screen,
      priority: priorities[0]!,
      perspectives,
      title: spec.title,
      preconditions: texts('precondition'),
      steps,
      expected,
      note: texts('note').join('\n'),
      implemented,
      file: spec.file,
      line: spec.line,
      result: implemented ? (results.get(specKey(spec, describePath)) ?? '未実行') : '未実行',
    });
  });

  const screenOrder = (s: Screen) => SCREENS.indexOf(s);
  cases.sort((a, b) => screenOrder(a.screen) - screenOrder(b.screen) || a.id.localeCompare(b.id));
  return { cases, errors };
}

// ---------- 集計 ----------

const statusLabel = (c: TestCase) => (c.implemented ? '自動化済み' : '未実装');
const perspectiveLabels = (c: TestCase) => c.perspectives.map((p) => PERSPECTIVES[p]).join('、');
const numbered = (items: string[]) =>
  items.length === 1 ? items[0]! : items.map((s, i) => `${i + 1}. ${s}`).join('\n');

function summarize(cases: TestCase[]) {
  return SCREENS.map((screen) => {
    const rows = cases.filter((c) => c.screen === screen);
    const done = rows.filter((c) => c.implemented);
    const count = (pred: (c: TestCase) => boolean) => rows.filter(pred).length;
    return {
      screen,
      implemented: done.length,
      backlog: rows.length - done.length,
      total: rows.length,
      p0: count((c) => c.priority === 'P0'),
      p1: count((c) => c.priority === 'P1'),
      p2: count((c) => c.priority === 'P2'),
      passed: done.filter((c) => c.result === '成功').length,
      failed: done.filter((c) => c.result === '失敗').length,
      flaky: done.filter((c) => c.result === '不安定').length,
      notRun: done.filter((c) => c.result === '未実行' || c.result === 'スキップ').length,
    };
  });
}

function coverageCell(cases: TestCase[], screen: Screen, perspective: Perspective) {
  const rows = cases.filter((c) => c.screen === screen && c.perspectives.includes(perspective));
  const done = rows.filter((c) => c.implemented).length;
  const backlog = rows.length - done;
  const text = [done > 0 ? String(done) : '', backlog > 0 ? `未${backlog}` : '']
    .filter(Boolean)
    .join('+');
  return { text, done, backlog };
}

// ---------- Markdown（差分レビュー用。実行結果は含めない） ----------

function renderMarkdown(cases: TestCase[]) {
  const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
  const row = (cols: (string | number)[]) => `| ${cols.map((c) => cell(String(c))).join(' | ')} |`;
  const summary = summarize(cases);
  const implemented = cases.filter((c) => c.implemented).length;
  const perspectiveKeys = Object.keys(PERSPECTIVES) as Perspective[];

  const lines = [
    '# E2E テストケース一覧',
    '',
    '> **自動生成ファイルです。直接編集しないでください。**',
    '> 正本は各 spec の `caseMeta()`（`e2e/fixtures/case-meta.ts`）で、`pnpm e2e:cases` で再生成します。',
    '> 人が読む一覧は同じ内容の `e2e-test-cases.xlsx`（実行結果付き）を参照してください。',
    '',
    `自動化済み ${implemented} 件 / 未実装 ${cases.length - implemented} 件 / 合計 ${cases.length} 件`,
    '',
    '## サマリー',
    '',
    row(['画面', '自動化済み', '未実装', '合計', 'P0', 'P1', 'P2']),
    row(Array(7).fill('---')),
    ...summary.map((s) => row([s.screen, s.implemented, s.backlog, s.total, s.p0, s.p1, s.p2])),
    row([
      '**合計**',
      implemented,
      cases.length - implemented,
      cases.length,
      ...(['P0', 'P1', 'P2'] as const).map((p) => cases.filter((c) => c.priority === p).length),
    ]),
    '',
    '## カバレッジ（画面 × 観点）',
    '',
    '数字 = 自動化済み件数、`未n` = 未実装 n 件、空欄 = テストなし（対象外または未検討）',
    '',
    row(['画面', ...perspectiveKeys.map((p) => PERSPECTIVES[p])]),
    row(Array(perspectiveKeys.length + 1).fill('---')),
    ...SCREENS.map((screen) =>
      row([screen, ...perspectiveKeys.map((p) => coverageCell(cases, screen, p).text)])
    ),
    '',
    '## 画面別テストケース',
  ];

  for (const s of summary) {
    if (s.total === 0) continue;
    lines.push(
      '',
      `### ${s.screen}（自動化済み ${s.implemented} / 未実装 ${s.backlog}）`,
      '',
      row([
        'ID',
        '優先度',
        '観点',
        'テストケース',
        '前提条件',
        '手順',
        '期待結果',
        '状態',
        '備考',
        'spec',
      ]),
      row(Array(10).fill('---')),
      ...cases
        .filter((c) => c.screen === s.screen)
        .map((c) =>
          row([
            c.id,
            c.priority,
            perspectiveLabels(c),
            c.title,
            c.preconditions.join('\n'),
            numbered(c.steps),
            numbered(c.expected),
            statusLabel(c),
            c.note,
            c.file,
          ])
        )
    );
  }
  return lines.join('\n') + '\n';
}

// ---------- Excel（人が読む一覧） ----------

const COLOR = {
  header: 'FF1F4E78',
  headerFont: 'FFFFFFFF',
  backlog: 'FFFFF2CC',
  passed: 'FFC6EFCE',
  failed: 'FFF8CBAD',
  flaky: 'FFFFEB9C',
  covered: 'FFC6EFCE',
  border: 'FFBFBFBF',
  total: 'FFDDEBF7',
} as const;

const fill = (argb: string): ExcelJS.Fill => ({
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb },
});
const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: COLOR.border } },
  bottom: { style: 'thin', color: { argb: COLOR.border } },
  left: { style: 'thin', color: { argb: COLOR.border } },
  right: { style: 'thin', color: { argb: COLOR.border } },
};

function styleHeader(row: ExcelJS.Row) {
  row.eachCell((c) => {
    c.font = { bold: true, color: { argb: COLOR.headerFont } };
    c.fill = fill(COLOR.header);
    c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    c.border = thinBorder;
  });
  row.height = 22;
}

/** 折り返し表示に必要な行数から行の高さを見積もる（全角は2文字幅で数える） */
function estimateHeight(values: string[], widths: number[]) {
  const lines = values.map((v, i) =>
    v.split('\n').reduce((sum, part) => {
      const w = [...part].reduce((n, ch) => n + (ch.charCodeAt(0) > 0xff ? 2 : 1), 0);
      return sum + Math.max(1, Math.ceil(w / Math.max(1, (widths[i] ?? 10) - 1)));
    }, 0)
  );
  return Math.max(18, Math.max(...lines) * 15 + 4);
}

const CASE_COLUMNS = [
  { header: 'ID', key: 'id', width: 11 },
  { header: '画面', key: 'screen', width: 13 },
  { header: '優先度', key: 'priority', width: 8 },
  { header: '観点', key: 'perspectives', width: 16 },
  { header: 'テストケース', key: 'title', width: 38 },
  { header: '前提条件', key: 'preconditions', width: 26 },
  { header: '手順', key: 'steps', width: 44 },
  { header: '期待結果', key: 'expected', width: 44 },
  { header: '状態', key: 'status', width: 11 },
  { header: '実行結果', key: 'result', width: 10 },
  { header: '備考', key: 'note', width: 30 },
  { header: 'spec', key: 'file', width: 24 },
  { header: '行', key: 'line', width: 6 },
] as const;

function addCaseSheet(wb: ExcelJS.Workbook, name: string, cases: TestCase[], withResult: boolean) {
  const columns = CASE_COLUMNS.filter((c) => withResult || c.key !== 'result');
  const ws = wb.addWorksheet(name, {
    views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }],
    properties: { defaultRowHeight: 18 },
  });
  ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  styleHeader(ws.getRow(1));

  for (const c of cases) {
    const values: Record<string, string | number> = {
      id: c.id,
      screen: c.screen,
      priority: c.priority,
      perspectives: perspectiveLabels(c),
      title: c.title,
      preconditions: c.preconditions.join('\n'),
      steps: numbered(c.steps),
      expected: numbered(c.expected),
      status: statusLabel(c),
      result: c.implemented ? c.result : '',
      note: c.note,
      file: c.file,
      line: c.line,
    };
    const row = ws.addRow(values);
    row.height = estimateHeight(
      columns.map((col) => String(values[col.key] ?? '')),
      columns.map((col) => col.width)
    );
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = columns[colNumber - 1]?.key;
      cell.alignment = {
        vertical: 'top',
        wrapText: true,
        horizontal: key === 'priority' || key === 'line' || key === 'result' ? 'center' : 'left',
      };
      cell.border = thinBorder;
      if (!c.implemented) cell.fill = fill(COLOR.backlog);
      if (key === 'result') {
        const color = { 成功: COLOR.passed, 失敗: COLOR.failed, 不安定: COLOR.flaky }[
          c.result as '成功' | '失敗' | '不安定'
        ];
        if (color && c.implemented) cell.fill = fill(color);
      }
    });
  }
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
  return ws;
}

function addSummarySheet(
  wb: ExcelJS.Workbook,
  cases: TestCase[],
  runAt: string | null,
  generatedAt: string
) {
  const ws = wb.addWorksheet('サマリー');
  ws.columns = [{ width: 16 }, ...Array(10).fill({ width: 11 })] as Partial<ExcelJS.Column>[];
  const implemented = cases.filter((c) => c.implemented).length;

  ws.getCell('A1').value = 'SmartRetail Pro E2E テストケース一覧';
  ws.getCell('A1').font = { bold: true, size: 16 };
  const info: [string, string][] = [
    ['生成日時', generatedAt],
    [
      '最終実行',
      runAt
        ? formatJst(new Date(runAt))
        : '実行結果なし（pnpm test:e2e の後に pnpm e2e:cases を実行すると反映）',
    ],
    [
      '件数',
      `自動化済み ${implemented} 件 / 未実装 ${cases.length - implemented} 件 / 合計 ${cases.length} 件`,
    ],
    [
      '更新方法',
      'このファイルは自動生成です。spec の caseMeta() を修正し、pnpm e2e:cases で再生成してください。',
    ],
  ];
  info.forEach(([label, value], i) => {
    const row = ws.getRow(i + 3);
    row.getCell(1).value = label;
    row.getCell(1).font = { bold: true };
    row.getCell(2).value = value;
  });

  let r = 8;
  const header = ws.getRow(r);
  header.values = [
    '画面',
    '自動化済み',
    '未実装',
    '合計',
    'P0',
    'P1',
    'P2',
    '成功',
    '失敗',
    '不安定',
    '未実行',
  ];
  styleHeader(header);
  const summary = summarize(cases);
  const totals = Array(10).fill(0) as number[];
  for (const s of summary) {
    const nums = [
      s.implemented,
      s.backlog,
      s.total,
      s.p0,
      s.p1,
      s.p2,
      s.passed,
      s.failed,
      s.flaky,
      s.notRun,
    ];
    nums.forEach((n, i) => (totals[i] = (totals[i] ?? 0) + n));
    const row = ws.getRow(++r);
    row.values = [s.screen, ...nums];
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      cell.border = thinBorder;
      if (col > 1) cell.alignment = { horizontal: 'center' };
      if (col === 3 && s.backlog > 0) cell.fill = fill(COLOR.backlog);
      if (col === 9 && s.failed > 0) cell.fill = fill(COLOR.failed);
    });
  }
  const totalRow = ws.getRow(++r);
  totalRow.values = ['合計', ...totals];
  totalRow.eachCell((cell, col) => {
    cell.font = { bold: true };
    cell.fill = fill(COLOR.total);
    cell.border = thinBorder;
    if (col > 1) cell.alignment = { horizontal: 'center' };
  });

  const definitionTable = (title: string, rows: [string, string][]) => {
    r += 2;
    ws.getCell(r, 1).value = title;
    ws.getCell(r, 1).font = { bold: true, size: 12 };
    for (const [key, desc] of rows) {
      r += 1;
      ws.getCell(r, 1).value = key;
      ws.getCell(r, 1).font = { bold: true };
      ws.getCell(r, 2).value = desc;
    }
  };
  definitionTable(
    '優先度',
    Object.entries(PRIORITIES).map(([k, v]) => [k, v])
  );
  definitionTable('状態', [
    ['自動化済み', 'spec に実装済みのテスト'],
    ['未実装', 'test.fixme で登録済み・未実装のテスト（黄色の行）'],
  ]);
  definitionTable('実行結果', [
    ['成功', 'e2e/results.json で成功'],
    ['失敗', 'リトライ後も失敗'],
    ['不安定', 'リトライで成功（flaky）'],
    ['未実行', '実行結果が無い、またはスキップ'],
  ]);
  definitionTable('実行方法', [
    ['1件だけ実行', 'pnpm exec playwright test --grep @STR-002'],
    ['優先度で実行', 'pnpm exec playwright test --grep @p0'],
    ['観点で実行', 'pnpm exec playwright test --grep @search-text'],
  ]);
  definitionTable(
    '観点タグ',
    Object.entries(PERSPECTIVES).map(([tag, label]) => [label, `@${tag}`])
  );
  return ws;
}

function addCoverageSheet(wb: ExcelJS.Workbook, cases: TestCase[]) {
  const perspectiveKeys = Object.keys(PERSPECTIVES) as Perspective[];
  const ws = wb.addWorksheet('カバレッジ', { views: [{ state: 'frozen', xSplit: 1, ySplit: 4 }] });
  ws.columns = [{ width: 16 }, ...perspectiveKeys.map(() => ({ width: 9 }))];
  ws.getCell('A1').value = 'カバレッジ（画面 × 観点）';
  ws.getCell('A1').font = { bold: true, size: 14 };
  ws.getCell('A2').value =
    '数字 = 自動化済み件数（緑）／「未n」= 未実装 n 件（黄）／空欄 = テストなし（対象外または未検討）';

  const header = ws.getRow(4);
  header.values = ['画面', ...perspectiveKeys.map((p) => PERSPECTIVES[p])];
  // 縦書き（textRotation）は Numbers / Google スプレッドシートで崩れるため、折り返しで表示する
  styleHeader(header);
  header.height = 50;

  SCREENS.forEach((screen, i) => {
    const row = ws.getRow(5 + i);
    row.getCell(1).value = screen;
    row.getCell(1).font = { bold: true };
    row.getCell(1).border = thinBorder;
    perspectiveKeys.forEach((p, j) => {
      const { text, done, backlog } = coverageCell(cases, screen, p);
      const cell = row.getCell(2 + j);
      cell.value = text;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
      if (done > 0) cell.fill = fill(COLOR.covered);
      else if (backlog > 0) cell.fill = fill(COLOR.backlog);
    });
  });
  return ws;
}

function formatJst(date: Date) {
  return date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
}

async function writeExcel(cases: TestCase[], runAt: string | null) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'pnpm e2e:cases';
  const generatedAt = formatJst(new Date());
  addSummarySheet(wb, cases, runAt, generatedAt);
  addCaseSheet(wb, 'テストケース', cases, true);
  addCoverageSheet(wb, cases);
  addCaseSheet(
    wb,
    '未実装ケース',
    cases.filter((c) => !c.implemented),
    false
  );
  await wb.xlsx.writeFile(XLSX_PATH);
}

async function main() {
  const check = process.argv.includes('--check');
  const results = loadResults();
  const { cases, errors } = buildCases(listTests(), results.byKey);

  if (errors.length > 0) {
    process.stderr.write(`❌ caseMeta の記入漏れ・不整合が ${errors.length} 件あります\n`);
    errors.forEach((e) => process.stderr.write(`  - ${e}\n`));
    process.exit(1);
  }

  const markdown = renderMarkdown(cases);
  const implemented = cases.filter((c) => c.implemented).length;
  const counts = `自動化済み ${implemented} / 未実装 ${cases.length - implemented} / 合計 ${cases.length}`;

  if (check) {
    const current = fs.existsSync(MD_PATH) ? fs.readFileSync(MD_PATH, 'utf8') : '';
    if (current !== markdown) {
      process.stderr.write(
        `❌ ${MD_PATH} が spec と一致しません。pnpm e2e:cases を実行してください\n`
      );
      process.exit(1);
    }
    process.stdout.write(`✅ テストケース一覧は最新です（${counts}）\n`);
    return;
  }

  fs.writeFileSync(MD_PATH, markdown);
  await writeExcel(cases, results.runAt);
  process.stdout.write(`✅ ${XLSX_PATH} / ${MD_PATH} を生成しました（${counts}）\n`);
  if (!results.runAt) {
    process.stdout.write(
      '   実行結果なし: pnpm test:e2e の後に再実行すると Excel に結果が入ります\n'
    );
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});

#!/usr/bin/env python3
"""
Feature Development Workflow Script

Claude Code でタスク実行後、Codex でレビューを行う汎用ワークフロー。
最大3回のイテレーションでレビュー指摘を解消する。

Usage:
    python feature_workflow.py --plan path/to/task_plan.md
    python feature_workflow.py --plan path/to/task_plan.md --task "Task 1"
    python feature_workflow.py --plan path/to/task_plan.md --dry-run
"""

import argparse
import json
import os
import re
import subprocess
import sys
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional


# ============================================================================
# Configuration
# ============================================================================

MAX_REVIEW_ITERATIONS = int(os.environ.get("MAX_REVIEW_ITERATIONS", "3"))
CODEX_SESSION_REUSE = os.environ.get("CODEX_SESSION_REUSE", "true").lower() == "true"
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
WORKFLOW_DIR = ROOT_DIR / ".workflow"
REVIEW_DIR = ROOT_DIR / "review"
SESSION_DIR = WORKFLOW_DIR / "sessions"
LOG_DIR = WORKFLOW_DIR / "logs"
STATUS_DIR = WORKFLOW_DIR / "status"


# ============================================================================
# Data Classes
# ============================================================================

@dataclass
class Task:
    """タスク定義"""
    id: str
    name: str
    task_type: str  # backend, frontend, design, test
    target_files: list[str]
    instruction: str
    review_points: list[str]
    depends_on: list[str] = field(default_factory=list)


@dataclass
class TaskPlan:
    """タスクプラン"""
    feature_name: str
    phase: str
    tasks: list[Task]


@dataclass
class ReviewResult:
    """レビュー結果"""
    has_issues: bool
    issue_count: int
    high_count: int
    issues: list[dict]
    summary: str
    session_id: Optional[str] = None


@dataclass
class TaskStatus:
    """タスク実行状態"""
    task_id: str
    status: str  # pending, in_progress, completed, failed
    iterations: int = 0
    session_id: Optional[str] = None
    error: Optional[str] = None


# ============================================================================
# Logging
# ============================================================================

class Logger:
    """ログ出力"""

    COLORS = {
        "info": "\033[0;32m",    # green
        "warn": "\033[1;33m",    # yellow
        "error": "\033[0;31m",   # red
        "reset": "\033[0m",
    }

    def __init__(self, log_file: Optional[Path] = None):
        self.log_file = log_file
        if log_file:
            log_file.parent.mkdir(parents=True, exist_ok=True)

    def _log(self, level: str, msg: str):
        color = self.COLORS.get(level, "")
        reset = self.COLORS["reset"]
        timestamp = datetime.now().strftime("%H:%M:%S")
        formatted = f"{color}[{level.upper()}]{reset} {timestamp} {msg}"
        print(formatted)
        if self.log_file:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(f"[{level.upper()}] {timestamp} {msg}\n")

    def info(self, msg: str):
        self._log("info", msg)

    def warn(self, msg: str):
        self._log("warn", msg)

    def error(self, msg: str):
        self._log("error", msg)


# ============================================================================
# Task Plan Parser
# ============================================================================

def parse_task_plan(plan_path: Path) -> TaskPlan:
    """task_plan.md をパースしてタスク一覧を取得"""
    content = plan_path.read_text(encoding="utf-8")

    # メタ情報抽出
    feature_match = re.search(r"機能名:\s*(.+)", content)
    phase_match = re.search(r"対象フェーズ:\s*(.+)", content)

    feature_name = feature_match.group(1).strip() if feature_match else "unknown"
    phase = phase_match.group(1).strip() if phase_match else "implementation"

    # タスクセクション抽出
    task_pattern = re.compile(
        r"###\s+(Task\s+\d+):\s*(.+?)\n"
        r"(?:.*?)"
        r"\*\*種別:\*\*\s*(.+?)\n"
        r"(?:.*?)"
        r"\*\*対象ファイル:\*\*\s*(.+?)\n"
        r"(?:.*?)"
        r"(?:\*\*依存タスク:\*\*\s*(.+?)\n)?"
        r"(?:.*?)"
        r"\*\*指示:\*\*\n(.+?)"
        r"(?=\*\*レビュー観点:\*\*)"
        r"\*\*レビュー観点:\*\*\n(.+?)"
        r"(?=###|\Z)",
        re.DOTALL
    )

    tasks = []
    for match in task_pattern.finditer(content):
        task_id = match.group(1).strip().lower().replace(" ", "_")
        name = match.group(2).strip()
        task_type = match.group(3).strip()
        target_files = [f.strip() for f in match.group(4).split(",")]
        depends_raw = match.group(5)
        depends_on = []
        if depends_raw:
            depends_on = [d.strip().lower().replace(" ", "_")
                          for d in depends_raw.split(",")]
        instruction = match.group(6).strip()
        review_raw = match.group(7).strip()
        review_points = [
            line.strip("- ").strip()
            for line in review_raw.split("\n")
            if line.strip().startswith("-")
        ]

        tasks.append(Task(
            id=task_id,
            name=name,
            task_type=task_type,
            target_files=target_files,
            instruction=instruction,
            review_points=review_points,
            depends_on=depends_on,
        ))

    return TaskPlan(feature_name=feature_name, phase=phase, tasks=tasks)


# ============================================================================
# Claude Code Executor
# ============================================================================

def run_claude_code(
    instruction: str,
    target_files: list[str],
    session_id: Optional[str] = None,
    logger: Optional[Logger] = None,
) -> tuple[bool, Optional[str]]:
    """
    Claude Code (claude CLI) でタスクを実行

    Returns:
        (success, session_id)
    """
    if logger:
        logger.info(f"Claude Code 実行: {instruction[:50]}...")

    # プロンプト構築
    prompt = f"""
以下のタスクを実行してください。

## 対象ファイル
{chr(10).join(f'- {f}' for f in target_files)}

## 指示
{instruction}

## 重要
- 既存のコードスタイルに従う
- 必要最小限の変更にとどめる
- テストが通ることを確認（可能な場合）
"""

    # claude CLI 実行
    cmd = ["claude", "-p", prompt, "--allowedTools", "Read,Write,Edit,Glob,Grep,Bash"]

    if session_id and CODEX_SESSION_REUSE:
        cmd.extend(["--resume", session_id])

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=600,  # 10分
            cwd=str(ROOT_DIR),
        )

        if result.returncode != 0:
            if logger:
                logger.error(f"Claude Code failed: {result.stderr}")
            return False, None

        # セッションID抽出（出力から）
        new_session_id = None
        session_match = re.search(r'session[_-]?id["\s:]+([a-zA-Z0-9_-]+)', result.stdout)
        if session_match:
            new_session_id = session_match.group(1)

        return True, new_session_id

    except subprocess.TimeoutExpired:
        if logger:
            logger.error("Claude Code timeout")
        return False, None
    except Exception as e:
        if logger:
            logger.error(f"Claude Code error: {e}")
        return False, None


# ============================================================================
# Codex Review
# ============================================================================

def run_codex_review(
    target_files: list[str],
    review_points: list[str],
    review_type: str,
    session_id: Optional[str] = None,
    output_file: Optional[Path] = None,
    logger: Optional[Logger] = None,
) -> ReviewResult:
    """
    Codex でレビュー実行（セッション継続対応）

    Returns:
        ReviewResult
    """
    if logger:
        logger.info(f"Codex レビュー実行 (session: {session_id or 'new'})")

    # 一時ファイルに対象コードを集約
    import tempfile
    with tempfile.NamedTemporaryFile(mode="w", suffix=".md", delete=False) as tmp:
        tmp.write("# レビュー対象\n\n")
        tmp.write("## 対象ファイル\n\n")
        for f in target_files:
            file_path = ROOT_DIR / f
            if file_path.exists():
                tmp.write(f"### {f}\n\n```\n")
                try:
                    content = file_path.read_text(encoding="utf-8")
                    tmp.write(content[:5000])  # 最大5000文字
                    if len(content) > 5000:
                        tmp.write("\n... (truncated)")
                except Exception:
                    tmp.write("(read error)")
                tmp.write("\n```\n\n")
        tmp.write("## レビュー観点\n\n")
        for point in review_points:
            tmp.write(f"- {point}\n")
        tmp_path = tmp.name

    # 出力先
    if output_file is None:
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        output_file = REVIEW_DIR / f"{timestamp}_review.md"
    output_file.parent.mkdir(parents=True, exist_ok=True)

    # codex-review.sh 呼び出し
    review_script = ROOT_DIR / ".workflow" / "scripts" / "codex-review.sh"
    if not review_script.exists():
        # フォールバック: 直接 codex exec
        return _run_codex_direct(
            tmp_path, output_file, review_type, session_id, logger
        )

    cmd = [
        "bash", str(review_script),
        tmp_path,
        str(output_file),
        review_type,
    ]
    if session_id:
        cmd.append(session_id)

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,  # 5分
            cwd=str(ROOT_DIR),
        )

        # 一時ファイル削除
        os.unlink(tmp_path)

        # 結果解析
        return _parse_review_result(output_file, logger)

    except subprocess.TimeoutExpired:
        if logger:
            logger.error("Codex review timeout")
        os.unlink(tmp_path)
        return ReviewResult(
            has_issues=True,
            issue_count=0,
            high_count=0,
            issues=[],
            summary="Review timeout",
        )
    except Exception as e:
        if logger:
            logger.error(f"Codex review error: {e}")
        os.unlink(tmp_path)
        return ReviewResult(
            has_issues=True,
            issue_count=0,
            high_count=0,
            issues=[],
            summary=f"Review error: {e}",
        )


def _run_codex_direct(
    input_path: str,
    output_file: Path,
    review_type: str,
    session_id: Optional[str],
    logger: Optional[Logger],
) -> ReviewResult:
    """直接 codex exec を呼び出す（フォールバック）"""
    prompt = f"""
以下のコードをレビューしてください。

レビュータイプ: {review_type}

対象:
{Path(input_path).read_text(encoding="utf-8")}

出力形式（JSON）:
{{"has_issues": true/false, "issues": [{{"severity": "high/medium/low", "message": "指摘"}}], "summary": "サマリー"}}
"""

    cmd = ["codex", "exec"]
    if session_id:
        cmd.extend(["resume", session_id])
    cmd.extend([
        "--skip-git-repo-check",
        "--dangerously-bypass-approvals-and-sandbox",
        "--json",
        prompt,
    ])

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,
            cwd=str(ROOT_DIR),
        )

        # JSON抽出
        json_match = re.search(r'\{[^{}]*"has_issues"[^{}]*\}', result.stdout)
        if json_match:
            data = json.loads(json_match.group())
            issues = data.get("issues", [])
            high_count = sum(1 for i in issues if i.get("severity") == "high")
            return ReviewResult(
                has_issues=data.get("has_issues", False),
                issue_count=len(issues),
                high_count=high_count,
                issues=issues,
                summary=data.get("summary", ""),
            )

    except Exception as e:
        if logger:
            logger.error(f"Codex direct call error: {e}")

    return ReviewResult(
        has_issues=False,
        issue_count=0,
        high_count=0,
        issues=[],
        summary="Could not parse review result",
    )


def _parse_review_result(review_file: Path, logger: Optional[Logger]) -> ReviewResult:
    """レビュー結果ファイルを解析"""
    if not review_file.exists():
        return ReviewResult(
            has_issues=True,
            issue_count=0,
            high_count=0,
            issues=[],
            summary="Review file not created",
        )

    content = review_file.read_text(encoding="utf-8")

    # YAML frontmatter 解析
    has_issues = "has_issues: true" in content
    issue_count_match = re.search(r"issue_count:\s*(\d+)", content)
    issue_count = int(issue_count_match.group(1)) if issue_count_match else 0

    # High 件数カウント
    high_count = content.lower().count("| high |")

    # セッションID取得
    session_file = review_file.with_suffix(".session")
    session_id = None
    if session_file.exists():
        session_id = session_file.read_text(encoding="utf-8").strip()

    # サマリー抽出
    summary_match = re.search(r"\*\*サマリー:\*\*\s*(.+)", content)
    summary = summary_match.group(1).strip() if summary_match else ""

    return ReviewResult(
        has_issues=has_issues,
        issue_count=issue_count,
        high_count=high_count,
        issues=[],  # 詳細は省略
        summary=summary,
        session_id=session_id,
    )


# ============================================================================
# Workflow Executor
# ============================================================================

def execute_task(
    task: Task,
    plan_name: str,
    logger: Logger,
    dry_run: bool = False,
    enable_review: bool = True,
) -> TaskStatus:
    """
    単一タスクの実行（Claude Code + Codex レビュー、最大3回）
    """
    logger.info(f"=== Task: {task.name} ===")
    logger.info(f"種別: {task.task_type}")
    logger.info(f"対象: {', '.join(task.target_files)}")
    logger.info(f"レビュー: {'有効' if enable_review else '無効'}")

    if dry_run:
        logger.info("[DRY-RUN] スキップ")
        return TaskStatus(task_id=task.id, status="skipped")

    status = TaskStatus(task_id=task.id, status="in_progress")
    session_id: Optional[str] = None

    # セッション復元
    session_file = SESSION_DIR / f"{task.id}.session"
    if session_file.exists() and CODEX_SESSION_REUSE:
        session_id = session_file.read_text(encoding="utf-8").strip()
        logger.info(f"セッション復元: {session_id}")

    # レビュー無効の場合は1回のみ実行
    max_iterations = MAX_REVIEW_ITERATIONS if enable_review else 1

    for iteration in range(1, max_iterations + 1):
        status.iterations = iteration
        logger.info(f"--- Iteration {iteration}/{max_iterations} ---")

        # 1. Claude Code でタスク実行
        success, new_session = run_claude_code(
            instruction=task.instruction,
            target_files=task.target_files,
            session_id=session_id,
            logger=logger,
        )

        if not success:
            logger.error("Claude Code 実行失敗")
            status.status = "failed"
            status.error = "Claude Code execution failed"
            return status

        # レビュー無効の場合はここで完了
        if not enable_review:
            logger.info("レビュー無効 - タスク完了")
            status.status = "completed"
            return status

        # 2. Codex でレビュー
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        review_file = REVIEW_DIR / f"{timestamp}_{plan_name}_{task.id}_review_{iteration}.md"

        review_result = run_codex_review(
            target_files=task.target_files,
            review_points=task.review_points,
            review_type=task.task_type,
            session_id=session_id,
            output_file=review_file,
            logger=logger,
        )

        # セッションID更新・保存
        if review_result.session_id:
            session_id = review_result.session_id
            SESSION_DIR.mkdir(parents=True, exist_ok=True)
            session_file.write_text(session_id, encoding="utf-8")
            status.session_id = session_id

        logger.info(f"レビュー結果: 指摘 {review_result.issue_count}件 (High: {review_result.high_count}件)")

        # 3. 指摘なし → 完了
        if not review_result.has_issues:
            logger.info("指摘なし - タスク完了")
            status.status = "completed"
            return status

        # 4. 最終イテレーションで High なし → 完了
        if iteration == MAX_REVIEW_ITERATIONS:
            if review_result.high_count == 0:
                logger.info("High 指摘なし - タスク完了")
                status.status = "completed"
                return status
            else:
                logger.warn("High 指摘残存 - 人間介入が必要")
                _generate_intervention_report(task, plan_name, review_result, review_file, logger)
                status.status = "intervention_required"
                status.error = f"High severity issues remain: {review_result.high_count}"
                return status

        # 5. 指摘あり → Claude Code で修正（次のイテレーションへ）
        logger.info("指摘あり - 修正実行")

        fix_instruction = f"""
前回のレビューで以下の指摘を受けました。修正してください。

## 指摘サマリー
{review_result.summary}

## 対象ファイル
{chr(10).join(f'- {f}' for f in task.target_files)}

## 対応方針
- Iteration {iteration}/{MAX_REVIEW_ITERATIONS}
- High/Medium 優先で対応
- Low は可能な範囲で対応

## 元の指示（参考）
{task.instruction}
"""
        success, _ = run_claude_code(
            instruction=fix_instruction,
            target_files=task.target_files,
            session_id=session_id,
            logger=logger,
        )

        if not success:
            logger.error("修正実行失敗")
            status.status = "failed"
            status.error = "Fix execution failed"
            return status

    return status


def _generate_intervention_report(
    task: Task,
    plan_name: str,
    review_result: ReviewResult,
    review_file: Path,
    logger: Logger,
):
    """人間介入レポート生成"""
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    report_file = REVIEW_DIR / f"INTERVENTION_REQUIRED_{timestamp}_{plan_name}_{task.id}.md"

    content = f"""# 人間介入が必要です

**生成日時:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**タスク:** {task.name} ({task.id})
**種別:** {task.task_type}

---

## 状況

自動レビュー修正が最大回数 ({MAX_REVIEW_ITERATIONS}回) に達しましたが、
High 優先度の指摘が {review_result.high_count}件 残存しています。

## 対象ファイル

{chr(10).join(f'- `{f}`' for f in task.target_files)}

## 最終レビュー結果

- レビューファイル: `{review_file}`
- サマリー: {review_result.summary}

## 推奨アクション

1. 上記レビューファイルで指摘内容を確認
2. 対象ファイルを手動で修正
3. 以下のコマンドで再実行:

```bash
python workflow/scripts/feature_workflow.py --plan <plan_file> --task "{task.id}"
```
"""

    report_file.write_text(content, encoding="utf-8")
    logger.warn(f"介入レポート生成: {report_file}")


def run_workflow(
    plan_path: Path,
    target_task: Optional[str] = None,
    dry_run: bool = False,
    enable_review: bool = True,
):
    """ワークフロー実行"""
    # ログ設定
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_file = LOG_DIR / f"{timestamp}_workflow.log"
    logger = Logger(log_file)

    # プラン名抽出（ファイル名から拡張子を除去）
    plan_name = plan_path.stem  # e.g., "favorite_task_plan"

    logger.info(f"Workflow開始: {plan_path}")
    logger.info(f"レビュー: {'有効' if enable_review else '無効'}")

    # タスクプラン読み込み
    try:
        plan = parse_task_plan(plan_path)
    except Exception as e:
        logger.error(f"タスクプラン読み込み失敗: {e}")
        sys.exit(1)

    logger.info(f"機能名: {plan.feature_name}")
    logger.info(f"フェーズ: {plan.phase}")
    logger.info(f"タスク数: {len(plan.tasks)}")

    # ステータスファイル
    STATUS_DIR.mkdir(parents=True, exist_ok=True)
    status_file = STATUS_DIR / f"{plan.feature_name.replace(' ', '_')}_status.json"

    # 対象タスク絞り込み
    tasks_to_run = plan.tasks
    if target_task:
        target_id = target_task.lower().replace(" ", "_")
        tasks_to_run = [t for t in plan.tasks if t.id == target_id]
        if not tasks_to_run:
            logger.error(f"タスク '{target_task}' が見つかりません")
            sys.exit(1)

    # 実行
    completed_tasks = set()
    results: list[TaskStatus] = []

    for task in tasks_to_run:
        # 依存チェック
        unmet_deps = [d for d in task.depends_on if d not in completed_tasks]
        if unmet_deps:
            logger.warn(f"依存タスク未完了: {unmet_deps} - スキップ")
            results.append(TaskStatus(
                task_id=task.id,
                status="skipped",
                error=f"Unmet dependencies: {unmet_deps}",
            ))
            continue

        # タスク実行
        status = execute_task(task, plan_name, logger, dry_run, enable_review)
        results.append(status)

        if status.status == "completed":
            completed_tasks.add(task.id)
        elif status.status in ("failed", "intervention_required"):
            logger.error(f"タスク '{task.name}' 失敗 - ワークフロー中断")
            break

    # ステータス保存
    status_data = {
        "feature": plan.feature_name,
        "started_at": timestamp,
        "updated_at": datetime.now().isoformat(),
        "status": "completed" if all(r.status == "completed" for r in results) else "failed",
        "tasks": [
            {
                "id": r.task_id,
                "status": r.status,
                "iterations": r.iterations,
                "session_id": r.session_id,
                "error": r.error,
            }
            for r in results
        ],
    }
    status_file.write_text(json.dumps(status_data, indent=2, ensure_ascii=False), encoding="utf-8")

    # サマリー出力
    logger.info("=== Workflow Summary ===")
    for r in results:
        status_icon = {
            "completed": "✅",
            "failed": "❌",
            "intervention_required": "⚠️",
            "skipped": "⏭️",
        }.get(r.status, "?")
        logger.info(f"{status_icon} {r.task_id}: {r.status} (iterations: {r.iterations})")

    logger.info(f"ログ: {log_file}")
    logger.info(f"ステータス: {status_file}")


# ============================================================================
# CLI
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="Feature Development Workflow")
    parser.add_argument(
        "--plan", "-p",
        required=True,
        help="タスクプランファイル (task_plan.md)",
    )
    parser.add_argument(
        "--task", "-t",
        help="実行するタスク（指定しない場合は全タスク）",
    )
    parser.add_argument(
        "--dry-run", "-n",
        action="store_true",
        help="実行せず計画のみ表示",
    )
    parser.add_argument(
        "--no-review",
        action="store_true",
        help="レビューをスキップ（デフォルト: レビュー有効）",
    )
    parser.add_argument(
        "--review",
        action="store_true",
        default=True,
        help="レビューを有効化（デフォルト）",
    )

    args = parser.parse_args()

    plan_path = Path(args.plan)
    if not plan_path.exists():
        print(f"Error: Plan file not found: {plan_path}", file=sys.stderr)
        sys.exit(1)

    # --no-review が指定されていればレビュー無効
    enable_review = not args.no_review

    run_workflow(
        plan_path=plan_path,
        target_task=args.task,
        dry_run=args.dry_run,
        enable_review=enable_review,
    )


if __name__ == "__main__":
    main()

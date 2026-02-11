-- ============================================================
-- PowerJob Database Initialization Script
-- ============================================================
-- 目的: PowerJob Server用データベースの初期化
-- 参照: Issue #39, ADR-004
--
-- 注意: PowerJob Serverは初回起動時に自動でテーブルを作成する
--       このスクリプトはデータベースの作成のみを行う
-- ============================================================

-- PowerJob用データベースを作成
CREATE DATABASE IF NOT EXISTS `powerjob`
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

-- 権限付与（rootユーザーに既に権限がある場合は不要）
-- GRANT ALL PRIVILEGES ON powerjob.* TO 'root'@'%';
-- FLUSH PRIVILEGES;

-- ============================================================
-- PowerJob Server 初回起動時に以下のテーブルが自動作成される:
-- - app_info: アプリケーション登録情報
-- - container_info: コンテナ情報
-- - instance_info: ジョブインスタンス実行履歴
-- - job_info: ジョブ定義
-- - oms_lock: 分散ロック
-- - server_info: サーバー情報
-- - user_info: ユーザー情報
-- - workflow_info: ワークフロー定義
-- - workflow_instance_info: ワークフローインスタンス
-- - workflow_node_info: ワークフローノード
-- ============================================================

-- ============================================================
-- Smart Retail Simulator アプリケーション登録
-- ============================================================
-- 注意: PowerJob Server起動後、管理UIから以下を登録する
--
-- アプリ名: smart-retail-simulator
-- パスワード: (任意、デモ環境では空でも可)
-- ============================================================

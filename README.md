<div align="center">
  <img alt="SmartRetail Pro" width="80" height="80" src="./frontend/src/assets/smartretail-logo.svg">
  <h1>SmartRetail Pro</h1>

  <img src="https://img.shields.io/badge/Vue-3.5.13-brightgreen.svg"/>
  <img src="https://img.shields.io/badge/Vite-6.2.2-green.svg"/>
  <img src="https://img.shields.io/badge/Element Plus-2.9.9-blue.svg"/>
  <img src="https://img.shields.io/badge/license-MIT-green.svg"/>


</div>

![](https://foruda.gitee.com/images/1708618984641188532/a7cca095_716974.png "rainbow.png")



## プロジェクト概要

[√](https://github.com/jasonw-lab/smart-retail.git)

### 商品管理
- **商品一覧**: 登録された全商品を閲覧・検索できる画面。商品のステータス、カテゴリー、価格などでフィルタリング可能。
- **商品登録/編集**: 新規商品の登録や既存商品の情報更新が行える画面。商品名、説明、画像、価格、在庫数などを設定。
- **在庫管理**: リアルタイムで在庫状況を確認・更新できる画面。在庫不足アラートや入荷予定管理機能を搭載。
- **カテゴリー管理**: 商品カテゴリーの階層構造を管理する画面。ドラッグ&ドロップでの並び替えにも対応。

### 注文管理
- **注文一覧**: 全注文の一覧と詳細情報を表示。注文状態、支払い状況などでフィルタリング可能。
- **注文詳細**: 個別注文の詳細情報を表示。注文商品、配送情報、請求情報などを管理。
- **配送管理**: 注文の発送処理や配送状況の追跡が行える画面。物流情報との連携も可能。
- **返品・キャンセル処理**: 返品やキャンセルのリクエスト管理と処理を行う画面。

### 顧客管理
- **顧客一覧**: 登録顧客の一覧と詳細情報を表示。検索・フィルタリング機能を搭載。
- **顧客詳細**: 個別顧客の詳細情報、購入履歴、問い合わせ履歴などを一元管理。
- **会員ランク管理**: 顧客の会員ランクやポイント制度を管理する画面。
- **マーケティング**: メールマガジンの配信や特別オファーの管理が行える画面。

### システム機能

- **システム機能**：ユーザー管理、ロール管理、メニュー管理、部門管理、辞書管理などの機能モジュールを提供しています。
- **権限管理**：動的ルーティング、ボタン権限、ロール権限、データ権限など様々な権限管理方式をサポートしています。

- **基盤機能**：国際化、複数レイアウト、ダークモード、フルスクリーン、ウォーターマーク、APIドキュメント、コードジェネレーターなどの機能を提供しています。
- **継続的な更新**：プロジェクトは継続的にオープンソースとして更新され、ツールと依存関係がリアルタイムで更新されています。


## スクリーンショット

TODO


## 技術スタック

### フロントエンド
- **コアフレームワーク**: [Vue.js 3.5.13](https://vuejs.org/) - リアクティブなUIコンポーネントを構築するための進歩的なJavaScriptフレームワーク
- **開発ビルドツール**: [Vite 6.2.2](https://vitejs.dev/) - 高速な開発環境と最適化されたビルドを提供するモダンなフロントエンドツール
- **UIライブラリ**: [Element Plus 2.9.9](https://element-plus.org/) - Vue 3向けのデザインコンポーネントライブラリ
- **状態管理**: [Pinia 3.0.2](https://pinia.vuejs.org/) - 直感的でTypeScriptフレンドリーなVue用状態管理ライブラリ
- **ルーティング**: [Vue Router 4.5.0](https://router.vuejs.org/) - Vueアプリケーションのためのルーティングライブラリ
- **言語**: [TypeScript 5.8.3](https://www.typescriptlang.org/) - 静的型付けによりコード品質と開発効率を向上
- **HTTP通信**: [Axios 1.8.4](https://axios-http.com/) - ブラウザとNode.js用のPromiseベースのHTTPクライアント
- **国際化**: [Vue I18n 11.1.3](https://vue-i18n.intlify.dev/) - Vueアプリケーションの国際化対応ライブラリ
- **データ可視化**: [ECharts 5.6.0](https://echarts.apache.org/) - 強力なチャートとデータ可視化ライブラリ
- **エディタ**: [WangEditor 5.6.34](http://www.wangeditor.com/) - モダンなWebリッチテキストエディタ
- **CSS**: [Sass 1.86.3](https://sass-lang.com/) - 効率的なCSSの記述をサポートする拡張言語

### 開発ツール
- **コード品質**: [ESLint 9.25.0](https://eslint.org/), [Prettier 3.5.3](https://prettier.io/), [Stylelint 16.18.0](https://stylelint.io/) - コード品質とスタイルの統一を維持
- **コミット管理**: [Husky 9.1.7](https://typicode.github.io/husky/), [Commitlint 19.8.0](https://commitlint.js.org/) - Gitフックとコミットメッセージの標準化
- **パッケージ管理**: [pnpm](https://pnpm.io/) - 高速で効率的なNode.jsパッケージマネージャー
- **自動インポート**: [unplugin-auto-import 19.1.2](https://github.com/antfu/unplugin-auto-import) - コンポーネントと関数の自動インポート
- **ユーティリティ**: [UnoCSS 65.4.3](https://github.com/unocss/unocss) - インスタントでオンデマンドのユーティリティCSSエンジン

### バックエンド（オプション）
- **Java**: [Spring Boot](https://spring.io/projects/spring-boot) - エンタープライズアプリケーション開発のためのJavaフレームワーク
- **Node.js**: [Nest.js](https://nestjs.com/) - 効率的でスケーラブルなサーバーサイドアプリケーションを構築するためのフレームワーク


## プロジェクトの起動


- **環境準備**

| 環境タイプ      | 名称                   |
|----------------|------------------------|
| **開発ツール**   | [Visual Studio Code](https://code.visualstudio.com/Download) |
| **実行環境**     | Node 18以上 (推奨[22.9.0](https://npmmirror.com/mirrors/node/v22.9.0/))  |
> ⚠️ 注意：Node.js 20.6.0にはいくつかの互換性問題があるため、使用しないでください


- **クイックスタート**

```bash
# コードのクローン
git clone https://github.com/jasonw-lab/smart-retail.git.git

# ディレクトリに移動
cd mall-retail

# pnpmのインストール
npm install pnpm -g

# 依存関係のインストール
pnpm install

# 起動
pnpm run 
```


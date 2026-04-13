<div align="center">
  <img alt="SmartRetail Pro" width="80" height="80" src="./apps/frontend/src/assets/smartretail-logo.svg">
  <h1>SmartRetail Pro</h1>

  <img src="https://img.shields.io/badge/Vue-3.5.13-brightgreen.svg"/>
  <img src="https://img.shields.io/badge/Vite-6.2.2-green.svg"/>
  <img src="https://img.shields.io/badge/Element Plus-2.9.9-blue.svg"/>
  <img src="https://img.shields.io/badge/license-MIT-green.svg"/>
  

</div>

![](https://foruda.gitee.com/images/1708618984641188532/a7cca095_716974.png "rainbow.png")



## プロジェクト概要

`docs/design/smart-retail-requirements.md` と `docs/design/ui/smart-retail-ui-design.md` をベースに、無人スーパー向けの Phase 1 PoC を実装しています。  
ソース上では `apps/frontend/src/views/retail` と `apps/backend/src/main/java/com/youlai/boot/modules/retail/controller` を中心に、店舗監視・商品在庫管理・アラート対応・外部世界シミュレーションが実装対象です。

### ダッシュボード
- **ダッシュボード**: KPI、売上推移、在庫状況、最新アラートを可視化します。

### 店舗管理
- **店舗一覧**: 店舗の状態、所在地、稼働状況を一覧管理できます。
- **決済履歴**: 売上 / 決済データの一覧と集計 API を提供しています。
- **デバイス一覧**: 店舗配下デバイスの状態、最終Heartbeat、種別ごとの監視に対応しています。

### 商品・在庫
- **商品一覧**: 商品コード、商品名、カテゴリ、価格、発注点、最大在庫などを一覧・検索・登録・更新できます。
- **カテゴリ管理**: 商品カテゴリ API と商品一覧画面があり、カテゴリ単位での商品管理に対応しています。
- **在庫一覧**: 店舗別・商品別の在庫数量、ロット、賞味期限、状態を確認できます。
- **入出庫管理**: 入庫・出庫・廃棄を在庫トランザクションとして管理し、履歴参照に対応しています。

### アラート管理
- **アラート一覧**: 在庫切れ、賞味期限接近、在庫過多、通信断、決済端末異常などのアラートを一覧表示し、状態管理できます。
- **外部世界シミュレーション**: PowerJob Worker から Heartbeat と Payment を送信し、バックエンドの監視・検知フローを再現できます。

### 顧客管理
- TODO

### システム機能
- **管理基盤**: ユーザー、ロール、メニュー、部門、辞書、通知などの管理機能をベースとして備えています。
- **認証・認可**: Spring Security と JWT ベースの認証、ルーティング / ロール権限管理を提供しています。
- **API / ドキュメント**: Knife4j / OpenAPI による API ドキュメントを利用できます。
- **リアルタイム連携**: WebSocket / STOMP ベースの通信基盤を含みます。


## スクリーンショット

TODO


## 技術スタック

### フロントエンド
- **コアフレームワーク**: [Vue.js 3.5.13](https://vuejs.org/)
- **開発ビルドツール**: [Vite 6.3.2](https://vitejs.dev/)
- **言語**: [TypeScript 5.8.3](https://www.typescriptlang.org/)
- **UIライブラリ**: [Element Plus 2.9.9](https://element-plus.org/)
- **状態管理**: [Pinia 3.0.2](https://pinia.vuejs.org/)
- **ルーティング**: [Vue Router 4.5.0](https://router.vuejs.org/)
- **HTTP通信**: [Axios 1.8.4](https://axios-http.com/)
- **国際化**: [Vue I18n 11.1.3](https://vue-i18n.intlify.dev/)
- **データ可視化**: [ECharts 5.6.0](https://echarts.apache.org/), [vue-echarts 7.0.3](https://github.com/ecomfe/vue-echarts)
- **リアルタイム通信**: [STOMP.js 7.1.1](https://stomp-js.github.io/)
- **リッチテキスト / 補助UI**: WangEditor, SortableJS, ExcelJS, Codemirror
- **スタイル基盤**: Sass 1.86.3, UnoCSS 65.4.3, Animate.css 4.1.1

### 開発ツール
- **パッケージ管理**: [pnpm](https://pnpm.io/)
- **コード品質**: [ESLint 9.25.0](https://eslint.org/), [Prettier 3.5.3](https://prettier.io/), [Stylelint 16.18.0](https://stylelint.io/)
- **Gitフック / コミット補助**: Husky 9.1.7, Commitlint 19.8.0, Commitizen 4.3.1, cz-git 1.11.1
- **自動インポート / コンポーネント解決**: unplugin-auto-import 19.1.2, unplugin-vue-components 28.5.0
- **Mock 開発支援**: vite-plugin-mock-dev-server 1.8.5

### バックエンド
- **言語 / ランタイム**: Java 17
- **フレームワーク**: Spring Boot 3.3.6
- **セキュリティ**: Spring Security
- **ORM / SQLマッパー**: MyBatis Plus 3.5.5
- **コネクションプール**: Druid 1.2.24
- **APIドキュメント**: Knife4j 4.5.0 / OpenAPI 3
- **オブジェクトマッピング**: MapStruct 1.6.3
- **キャッシュ / 分散ロック**: Redis, Redisson 3.40.2, Caffeine
- **オブジェクトストレージ**: MinIO 8.5.10
- **ユーティリティ / 補助**: Hutool 5.8.34, Spring Dotenv 4.0.0, FastExcel 1.1.0
- **テスト**: Spring Boot Test, Testcontainers 1.19.7, REST Assured ベースの API テスト

### シミュレーター
- **言語 / ランタイム**: Java 17
- **フレームワーク**: Spring Boot 3.3.5
- **ジョブ基盤**: PowerJob Worker 5.1.1
- **通信**: Spring Web, Jackson Databind


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

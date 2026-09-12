# レビュー: _docs 設計ドキュメント・ADR・アーキテクチャ設計

- レビュー日: 2026-07-10
- レビュアー: claude（フロントエンド React テックリード視点）
- 対象: `_docs/adr/ADR-001`〜`ADR-008`、`_docs/e2e-test-policy.md`、および実装との整合性
- 観点: ADRガバナンス / 認証・セキュリティ設計 / RSC境界設計 / 状態管理 / フォルダ構成 / E2E・自律修正プロンプト設計

## サマリー

| # | 指摘 | 重大度 |
|---|------|--------|
| 1 | 全ADRが「承認待ち/検討中」のまま実装済み（ADRライフサイクル不全） | High |
| 2 | i18n（next-intl / `[locale]`）のADR不在、ADR-001/006が実装と乖離 | High |
| 3 | access_token失効後、refresh_token有効でも強制再ログイン（設計意図と矛盾） | High |
| 4 | proxyの401リトライで request body を二重読取（設計コードのバグ） | High |
| 5 | STOMPチケット方式が結局生accessTokenをJSへ返し、採用理由と自己矛盾 | High |
| 6 | 並行401時のトークンリフレッシュ競合が未設計 | Medium |
| 7 | CSRF Origin検証がOriginヘッダ欠如時に素通し／実装のcsrfルート未反映 | Medium |
| 8 | route.ts から非HTTPハンドラ関数をexport（ビルドエラーになる設計例） | Medium |
| 9 | useStompの依存配列設計により再接続チャーン／StrictMode未考慮 | Medium |
| 10 | ADR-003とADR-007で初期データ受け渡し・URL状態の正パターンが矛盾 | Medium |
| 11 | fetchキャッシュ戦略（cache/revalidate/Next.jsバージョン前提）が未定義 | Medium |
| 12 | ESLint境界ルールが手動列挙でスケールせず、カバレッジに穴 | Medium |
| 13 | ADR-008とE2E方針書v2が矛盾し正本が不明 | Medium |
| 14 | ブラウザMSWではServer Component直接fetchをモックできない技術的欠落 | Medium |
| 15 | 自律修正ループのプロンプトにガードレールなし（テスト改変・モック改変リスク） | Medium |
| 16 | ADR間の命名・コード不整合（fetchFromProxy、ws-token vs ws-ticket 等） | Low |
| 17 | ライブラリバージョン表記の陳腐化と zustand persist のhydration未考慮 | Low |
| 18 | alert-store の unreadCount が重複受信でドリフト | Low |

総評: ADR群は「選択肢→決定→却下理由→トレードオフ」の構成が一貫しており、ハイブリッド認証やRSC境界の判断根拠も明文化されていて骨格は良質。一方で (a) ADRのライフサイクル管理が機能しておらず実装との乖離が固定化している、(b) セキュリティ設計（指摘3・5）に採用理由と結論が食い違う自己矛盾がある、(c) ADR間で正パターンが揺れている（指摘10・13）——の3点が構造的な問題。特に指摘3・5はレビュー承認前に設計自体の見直しを推奨する。

---

### 指摘1. 全ADRが「承認待ち/検討中」のまま実装が先行している（ADRライフサイクル不全）
260710 14:30 claude

重大度: High

対象: `_docs/adr/ADR-001-app-router-directory.md:5`, `_docs/adr/ADR-008-e2e-testing.md:5`（他全ADR共通）

ADR-001〜007は「承認待ち (2025-05)」、ADR-008は「検討中 (2026-05)」のまま1年以上経過しているが、リポジトリには App Router・ハイブリッド認証・E2E スイート（直近コミット「extend E2E coverage across all screens」）まで実装済み。ステータスが実態を反映していないため、ADRが「意思決定の記録」として機能しておらず、新規メンバーやAIレビュアーが「まだ未承認の提案」と誤読するリスクがある。ADR-002/003 は「改訂 (2026-05)」とあるが改訂履歴（何をなぜ変えたか）が本文にない。

推奨:
- 実装済みのADRは `Accepted (YYYY-MM-DD)` に更新し、承認者を明記する
- ステータス遷移（Proposed → Accepted → Superseded）の運用ルールを ADR-000 またはREADMEに定義する
- 改訂時は「変更履歴」セクション（e2e-test-policy.md にはある）を全ADRに追加する

### 指摘2. i18n（next-intl / `[locale]` ルーティング）のADRが存在せず、ADR-001/006 のディレクトリ構成・middleware例が実装と乖離
260710 14:30 claude

重大度: High

対象: `_docs/adr/ADR-001-app-router-directory.md:47-124`, `_docs/adr/ADR-006-app-folder-structure.md:55-281`

実装は `app/[locale]/(auth)`・`app/[locale]/(dashboard)` 構成で、middleware.ts は next-intl の `createIntlMiddleware` 合成・ロケールプレフィックス除去・`redirect` クエリ付与まで行っている。しかし:

- ADR-001/006 のディレクトリツリーに `[locale]` セグメントが存在しない
- ADR-006 の middleware サンプルはロケール非対応で、実装と全く異なる（認証済みlogin→`/`リダイレクトも実装には無い一方、実装の `/api/` 全スキップはADRに無い）
- i18nライブラリ選定（next-intl vs next-i18next 等）、ロケール戦略（prefix必須か、デフォルトロケール）、翻訳ファイル配置（`messages/`, `i18n/`）というアーキテクチャレベルの意思決定がどのADRにも記録されていない

`[locale]` の有無はルーティング・middleware・E2Eセレクタ・リンク生成すべてに波及する根幹の決定であり、ADR不在は乖離の中でも最も影響が大きい。

推奨:
- ADR-009 として i18n ルーティング設計（next-intl採用理由、`[locale]`セグメント、middleware合成方針）を起票する
- ADR-001/006 のツリー・middleware例を実装に合わせて改訂するか、「実装正はコードとADR-009」と明記して Superseded 扱いにする
- 同様にADRが無い横断的関心事（Sentry計装 `instrumentation.ts`、`lib/security`、`lib/env`）もADR化を検討する

### 指摘3. access_token Cookie失効後は refresh_token が有効でも強制再ログインになる（セッション継続性の設計欠陥）
260710 14:30 claude

重大度: High

対象: `_docs/adr/ADR-002-jwt-authentication.md:161-186, 220-223, 524-533`, `_docs/adr/ADR-006-app-folder-structure.md:265-268`

`access_token` Cookie の `maxAge` を `expiresIn`（30分）に設定しているため、失効と同時にブラウザから Cookie 自体が消える。その結果:

1. middleware は「Cookie有無チェック」のみ → 即ログインへリダイレクト
2. Server Component の `fetchFromBackend` も accessToken 不在で即 `redirect('/login')`
3. 事前リフレッシュも `check-expiry` が `token_expires_at` Cookie 消失により `expiresIn: 0` を返すため発火しない

つまり refresh_token が7日間有効に保たれているにもかかわらず、30分弱の離席（またはタブ復帰前のバックグラウンド時間）で必ず再ログインになる。トレードオフ欄の「25分以上離席時のみ再ログイン」は Vue 版（refreshToken 期限までセッション継続）からの大幅なUX後退であり、「既存Vue版と同等の認証体験」という暗黙の期待と矛盾する。業務システムの利用実態（昼休み・会議での離席）を考えると受容困難なリスク。

推奨:
- middleware で「access_token 無し かつ refresh_token 有り」の場合にリフレッシュを試行する経路を設計する（middleware内で直接リフレッシュ、または `/api/auth/refresh` 経由のリダイレクトフロー）
- 少なくとも access_token Cookie の maxAge を expiresIn より長くし（またはセッションCookie化し）、有効期限判定は `token_expires_at` ベースに統一する
- このトレードオフを受容する場合は「Vue版よりセッション継続性が短くなる」ことを明記し、プロダクトオーナー承認を得る

### 指摘4. proxy Route Handler の401リトライで request body を二重読取する（設計コードのバグ）
260710 14:30 claude

重大度: High

対象: `_docs/adr/ADR-002-jwt-authentication.md:272, 307, 326-340`

`fetchWithAuth()` は内部で `await request.text()` を実行するが、401時のリトライで同じ `NextRequest` に対して `fetchWithAuth` を再度呼んでいる。Request の body は一度しか読めないため、リトライ時に `TypeError: Body has already been read`（または空body送信）となり、「401→リフレッシュ→リトライ」という本ADRの中核フローが POST/PUT/PATCH で機能しない。また `request.text()` はバイナリを破壊するため、`multipart/form-data`（画像アップロード等）をproxyで扱えない制約も未記載。

推奨:
- ハンドラ冒頭で `const body = request.method !== 'GET' ? await request.text() : undefined;` と一度だけ読み、`fetchWithAuth(url, method, headers, body)` のようにbodyを引数で渡す設計に修正する
- バイナリ対応が必要なら `request.arrayBuffer()`／`request.body` のストリーム転送を採用し、対応範囲をADRに明記する
- 実装（`app/api/proxy/`）が同じパターンになっていないか確認し、E2E（商品更新の401→リフレッシュ経路）で回帰テストを追加する

### 指摘5. STOMP接続チケット方式が最終的に生の accessToken を JavaScript へ返しており、採用理由と自己矛盾している
260710 14:30 claude

重大度: High

対象: `_docs/adr/ADR-005-stomp-realtime.md:27-30, 44-52, 139-155, 201-227`

選択肢1の採用理由は「生のaccessTokenをJavaScriptに露出しない」だが、実際のフローは:

1. Client が `/api/auth/ws-ticket` でチケット取得
2. Client が `/api/ws/connect` にチケットを送り、**レスポンスで生の accessToken を受け取る**（`return NextResponse.json({ token: accessToken })`）
3. その accessToken を STOMP `connectHeaders` に設定

つまり最終的に accessToken は JS メモリ上に存在し、XSS 攻撃者は同一オリジンfetchで手順1→2をそのまま実行してトークンを窃取できる。これは却下した「選択肢2: accessTokenを直接返す方式」とセキュリティ的に等価であり、チケットの30秒TTL・ワンタイム性は攻撃者に対する障壁になっていない（攻撃者自身が新しいチケットを発行できるため）。2ホップ分の複雑性・Redis依存だけが増えている状態。

推奨:
- チケットを「トークンに交換してブラウザへ返す」のではなく、**チケット自体をSTOMP CONNECTヘッダ（またはhandshakeクエリ）でバックエンドへ渡し、バックエンドがサーバー間通信でチケット→トークン解決**する設計に変更する（バックエンド改修が必要になるため、却下済みの選択肢3との再比較が必要）
- バックエンド改修が不可なら、本方式のセキュリティ上の実効性を正直に「選択肢2と同等。複雑性に見合わないため選択肢2を採用」と書き直すか、リスク受容を明記する
- いずれにせよ現在の「XSSリスクの軽減」という採用理由の記述は誤解を招くため修正必須

### 指摘6. 並行リクエストが同時に401になった場合のリフレッシュ競合（single-flight）が未設計
260710 14:30 claude

重大度: Medium

対象: `_docs/adr/ADR-002-jwt-authentication.md:275-314, 342-360`

ダッシュボードのような画面では複数のクエリが並行して proxy を叩く。access_token 失効直後は複数リクエストが同時に401となり、それぞれが独立に `refreshAccessToken(refreshToken)` を呼ぶ。バックエンドが refresh token rotation（使い捨て）を採用している場合、最初の1件以外は無効な旧トークンでのリフレッシュとなり失敗 → `AUTH_EXPIRED` でセッション断。rotation でなくても Cookie の set が競合し `token_expires_at` の整合が崩れる可能性がある。Vue版の axios インターセプターで一般的な「リフレッシュ中は後続を待機させる」相当の設計が抜けている。

推奨:
- Route Handler 層でリフレッシュの single-flight 化（モジュールスコープの in-flight Promise 共有。マルチインスタンス時は Redis ロック）を設計に加える
- バックエンドの refresh token rotation 有無を確認し、ADRの前提として明記する
- 事前リフレッシュ（残5分）とリアクティブリフレッシュ（401時）の二重発火も同じ仕組みで排他する

### 指摘7. CSRF Origin検証が Origin ヘッダ欠如時に素通しになる／実装済みの csrf ルートが ADR に未反映
260710 14:30 claude

重大度: Medium

対象: `_docs/adr/ADR-002-jwt-authentication.md:258-265, 536-543`

`if (origin && !allowedOrigins.includes(origin))` は Origin ヘッダが無いリクエストを許可する（fail-open）。ブラウザの same-origin POST では Origin が付くが、一部の古いブラウザ・特殊なリクエスト経路では欠如し得るし、curl 等の直接リクエストは常に素通しになる（Cookie が無ければ実害はないが、防御の意図と実装が一致していない）。また `allowedOrigins` が `NEXT_PUBLIC_APP_URL` 未設定時に `[undefined]` となり実質無効化される点も未考慮。一方、実装には `app/api/auth/csrf/` ルートが存在しており、ADR-002 の CSRF対策表（SameSite=Lax + Origin検証のみ）と実装が既に乖離している。

推奨:
- Origin ヘッダ欠如時は拒否（fail-close）を基本とし、除外が必要なケースを明示的に列挙する
- 実装済みの CSRF トークン方式（`/api/auth/csrf`）を ADR-002 に反映し、Origin検証との役割分担を記載する
- 併せて refresh token をクエリパラメータで送る既存API仕様（`?refreshToken=xxx`）はアクセスログ・プロキシログへの残存リスクがあるため、既知の制約としてADRに明記する（バックエンド改修時の課題リストへ）

### 指摘8. route.ts から非HTTPハンドラ関数を export する設計例はビルドエラーになる
260710 14:30 claude

重大度: Medium

対象: `_docs/adr/ADR-005-stomp-realtime.md:124-135, 139-147`

`app/api/auth/ws-ticket/route.ts` から `validateAndConsumeTicket` を named export し、それを `app/api/ws/connect/route.ts` が import する設計になっている。Next.js の Route Handler ファイルは HTTP メソッド名と一部の設定値以外の export を許可しておらず、型チェック（`next build` の Route type validation）でエラーになる。また `ticketStore` の Map をルート間で共有できるのは同一サーバープロセス・同一モジュールインスタンスの場合のみで、開発時のHMRやビルド分割で分断されるリスクもある（Redis化の注記はあるが、開発環境でも壊れ得る点が未記載）。

推奨:
- チケットストアとその操作関数を `lib/auth/ws-ticket-store.ts` 等の共有モジュールへ切り出し、両ルートから import する構成に修正する
- ADRのサンプルコードは「そのまま動くこと」を品質基準とする（AI自律修正ループの参照元になるため、動かないサンプルは誤修正を誘発する）

### 指摘9. useStomp の依存配列にコールバック props が直接入っており、再接続チャーンと StrictMode 二重実行のリスクがある
260710 14:30 claude

重大度: Medium

対象: `_docs/adr/ADR-005-stomp-realtime.md:189-198, 309-319, 399-434`

`stableOptions` で一部オプションをメモ化している一方、`connect` の useCallback 依存配列には `options.onConnect / onDisconnect / onError` が生のまま入っている。呼び出し側の `use-alert-subscription` はインラインアロー関数（`onConnect: () => console.log(...)`）を渡しているため、毎レンダーで `connect` が再生成され、それに依存する `useEffect` がクリーンアップ（`disconnect`）→再実行を繰り返す。`isInitializedRef` はクリーンアップで false に戻すため抑止にならず、接続・切断のチャーンが発生し得る。さらに React 18 StrictMode の開発時二重マウントでは、非同期の `connect()`（チケット取得中）とクリーンアップの `disconnect()` が競合し、`clientRef.current = null` 後に古い接続が activate される競合状態も未考慮。

推奨:
- コールバック類は `useRef` に格納して最新値参照にし、`connect` の依存から外す（イベントハンドラの「latest ref」パターン）
- 接続処理に世代トークン（またはAbortController）を導入し、クリーンアップ後に完了した非同期接続を破棄する
- StrictMode 有効での接続回数を検証するテスト観点を ADR に追記する

### 指摘10. ADR-003 と ADR-007 で「商品一覧ページの正パターン」が矛盾している（props+placeholderData vs prefetch+HydrationBoundary、useState vs URL状態）
260710 14:30 claude

重大度: Medium

対象: `_docs/adr/ADR-003-server-client-boundary.md:113-171`, `_docs/adr/ADR-007-state-management.md:207-242, 399-453`

同一の商品一覧ページに対して:

- ADR-003: Server Component が `fetchFromBackend` で取得 → props で `initialData` を渡し `placeholderData` に使用。検索条件は Client 内の `useState(initialParams)` で管理
- ADR-007: Server Component で `queryClient.prefetchQuery` → `dehydrate` / `HydrationBoundary` で渡す。検索条件は `useSearchParams` ベースの `useProductFilters`（URL状態）

と、初期データ受け渡しと検索状態管理の両方で異なる正パターンを提示している。placeholderData 方式は params が変わっても同じ初期データを placeholder に使い続ける劣化があり、useState 方式は URL と表示状態が乖離してブラウザバック・リロード・URL共有が壊れる。ADR-007 自身が「URL状態: useSearchParams」と分類表で定めているため、ADR-003 の useState 例は自ADR群と不整合。チームがどちらを実装標準とすべきか判断できない。

推奨:
- 標準パターンを1つに決める（推奨: prefetch + HydrationBoundary + URL状態。placeholderData 方式は「軽量ページの簡易版」として位置づけを明記）
- 検索・ページネーション条件は URL を single source of truth とし、ADR-003 のコード例を useProductFilters ベースに書き換える
- 実装がどちらのパターンかを確認し、ADR側を実態へ揃える

### 指摘11. fetch キャッシュ戦略（cache / revalidate / Next.js バージョン前提）がどの ADR にも定義されていない
260710 14:30 claude

重大度: Medium

対象: `_docs/adr/ADR-002-jwt-authentication.md:211-218`, `_docs/adr/ADR-001-app-router-directory.md:154`

ADR-001 は「キャッシュ戦略（revalidate、tags）の学習コスト」をリスクとして挙げながら、その戦略を定義する ADR が存在しない。`fetchFromBackend` は `cache` / `next.revalidate` を一切指定しておらず、挙動が Next.js のバージョンに依存する（Next 14 では fetch はデフォルトキャッシュ、Next 15 では no-store デフォルト）。認証付きデータは Data Cache がサーバー側でユーザー横断に永続化されるため、キー設計（Authorization ヘッダ差分）を理解せずにキャッシュされると、古いデータの表示や意図しない共有につながる。採用 Next.js バージョンの明記もどのADRにもない。

推奨:
- 「認証付きAPIは原則 `cache: 'no-store'`（明示）」を規約として `fetchFromBackend` に組み込み、キャッシュしたいものだけ `revalidate`/`tags` をオプトインさせる方針をADR化する
- 前提とする Next.js メジャーバージョンと、バージョンアップ時に見直すべきキャッシュ挙動を ADR に明記する
- mutation 後の `revalidateTag` / TanStack Query invalidate の使い分け（Server起点データとClient起点データの整合）も同ADRで定義する

### 指摘12. ESLint 境界ルールが feature ごとの手動列挙でスケールせず、Server/Client 境界のカバレッジにも穴がある
260710 14:30 claude

重大度: Medium

対象: `_docs/adr/ADR-006-app-folder-structure.md:337-392`

`import/no-restricted-paths` の zones を feature ごとに手書きする設計（「他のfeatureも同様に設定...」）は、実装が既に9 features（alerts/auth/dashboard/devices/inventory/products/stores/system/transactions）ある現状で追随漏れが起きやすく、新 feature 追加時にルール追加を忘れると境界が静かに崩れる。また Client 専用コードの import 禁止が `target: './app/**/page.tsx'` のみで、`layout.tsx` や `features/*/components/` 配下の Server Component が対象外。`except: ['**/types/**', '**/public/**']` のグロブが no-restricted-paths の except 仕様（from からの相対パス）で意図通り機能するかも怪しい。

推奨:
- feature を動的列挙してzonesを生成する共通関数、もしくは `eslint-plugin-boundaries` のようなレイヤー定義型プラグインへの移行を検討する
- Server/Client 境界は ESLint だけでなく `import 'server-only'` / `'client-only'` パッケージによるビルド時強制を併用する（`lib/api/server.ts` に `server-only` を入れるのが最も確実）
- 現在の eslint.config.mjs が ADR の記載通りに設定されているか監査する

### 指摘13. ADR-008 と e2e-test-policy v2 が矛盾しており、E2E戦略の正本が不明
260710 14:30 claude

重大度: Medium

対象: `_docs/adr/ADR-008-e2e-testing.md:57-59`, `_docs/e2e-test-policy.md:4-20`

ADR-008 は「Playwright + MSW を採用候補（検討中）」のままだが、e2e-test-policy v2（2026-05-30）は「Playwright + Standalone Mock Server (mock-server.ts)」を前提に Phase 1 実装済みと記載しており、実装（`e2e/` 配下）も後者。つまり ADR-008 が却下寄りに評価した方式とは別の第3の方式（standalone HTTPモックサーバー）が実際の採用となっているのに、その意思決定（なぜMSWでなくstandaloneサーバーか——おそらく指摘14のServer Component直接fetch問題）がどこにも記録されていない。ディレクトリ構成・レポーター設定・テストシナリオも2文書間で食い違う。

推奨:
- ADR-008 を改訂して「Playwright + Standalone Mock Server 採用（MSWからの変更理由: Server Component の直接fetchをブラウザMSWでは捕捉できない等）」を Accepted で記録する
- e2e-test-policy.md を運用手順の正本、ADR-008 を意思決定の正本と役割を明記し、相互リンクする
- ADR-008 内の MSW ハンドラ例・playwright.config 例は実装済みの実物と差し替える

### 指摘14. ブラウザ MSW では Server Component の Backend 直接 fetch をモックできない（ADR-008 採用案の技術的欠落）
260710 14:30 claude

重大度: Medium

対象: `_docs/adr/ADR-008-e2e-testing.md:59-80, 134-224`

ADR-002/003 のハイブリッド構成では、初期データ取得は Next.js サーバープロセス内の `fetchFromBackend`（Node fetch）で行われる。ブラウザに注入する MSW Service Worker はこのサーバー側 fetch を捕捉できないため、ADR-008 のモック例（`/api/proxy/...` のブラウザレベルインターセプト）では P0 シナリオである「一覧ページの初期表示」がそもそもモックできない。実装が standalone mock server（`BACKEND_URL` をモックサーバーへ向ける方式）へ移った根本理由と推測されるが、ADR-008 にはこの制約の分析がなく、評価表の「App Router対応: ◎」は誤解を招く。

推奨:
- ADR-008 改訂時に「Server側fetchのモック方法」を評価軸に追加し、standalone mock server 採用の決定打として記録する（指摘13と併せて対応）
- MSW を使う場合の代替（`msw/node` を Next.js サーバープロセスに組み込む instrumentation 方式）も比較として残すと将来の再検討に有用

### 指摘15. 自律修正ループ（Claude CLI）のプロンプト設計にガードレールがなく、テスト・モック改変によるリグレッション隠蔽リスクがある
260710 14:30 claude

重大度: Medium

対象: `_docs/e2e-test-policy.md:204-243`

プロンプト設計・運用設計の観点で3点:

1. **プロンプトに禁止事項が含まれていない**: 実行コマンドは「失敗テストを修正せよ」のみ。エスカレーション基準（期待値変更は人間判断）は文書の別節にあるが、AIに渡るプロンプト本文に含まれないため強制力がない。AIは「アサーションを緩める」「テストをskipする」が最短の成功経路であることを踏まえた制約が必要
2. **「API応答不正 → mock-server.ts のレスポンス修正」が自動修正可(✅)とされているが、これはエスカレーション基準3（期待値自体の変更は人間判断）と矛盾**。モックはアプリの期待仕様の写しであり、アプリ側のバグでレスポンス処理が壊れた場合にモックを「合わせて」しまうと本物のリグレッションを隠蔽する
3. **修正の検収基準がない**: 「5ファイル以上の変更が必要」は事後判定であり、修正diffのレビュー（rule.md のレビュー形式での記録、PR分離）が実行フローに組み込まれていない

推奨:
- プロンプトテンプレートに制約を明記する。例:「アサーションの期待値・スナップショットの変更、テストのskip/削除、mock-server.tsのレスポンス変更は禁止。必要と判断した場合は修正せず理由を報告せよ」
- 失敗パターン表の「API応答不正」は原則エスカレート（❌）に変更し、モック修正はモック側の明白なタイポ等に限定する
- 自動修正はブランチ+PR経由とし、人間レビューを必須にするフローを§10.4に追記する

### 指摘16. ADR 間・ADR 内の命名/コード不整合（fetchFromProxy、ws-token vs ws-ticket、hooks 配置）
260710 14:30 claude

重大度: Low

対象: `_docs/adr/ADR-005-stomp-realtime.md:464-470`, `_docs/adr/ADR-006-app-folder-structure.md:112`, `_docs/adr/ADR-002-jwt-authentication.md:448`

- ADR-005 の alerts/page.tsx 例が `import { fetchFromProxy }` としつつ本文では `fetchFromBackend` を呼んでおり、import と使用が不一致（`fetchFromProxy` はどのADRにも定義がない）
- ADR-006 の api ツリーは `ws-token/route.ts` だが ADR-005 と実装は `ws-ticket`。また実装に存在する `captcha` / `me` / `csrf` / `health` / `report` ルートが ADR-006 のツリーに無い
- ADR-002 は `hooks/use-proactive-token-refresh.ts`（ルート直下 hooks/）に置くが、ADR-006 のフォルダ構成にルート直下 `hooks/` は存在しない（features/auth/hooks/ が妥当）

サンプルコードは AI 自律修正ループの参照コンテキストにもなるため、不整合は誤修正の種になる。

推奨:
- ADR横断で識別子・パスを実装に合わせて統一する（指摘2・13の改訂とまとめて実施可）
- ADR内コード例はコンパイル可能性をチェックする軽量CI（tsc --noEmit 対象のsnippets抽出等）を検討する

### 指摘17. ライブラリバージョン表記の陳腐化と zustand persist の hydration ミスマッチ未考慮
260710 14:30 claude

重大度: Low

対象: `_docs/adr/ADR-004-ui-library.md:173-186`, `_docs/adr/ADR-007-state-management.md:44-49, 251-283`

- ADR-007 は「Zustand v4」を明記するが v5 が2024年末に安定版となっており、2026年時点の新規採用としては古い。ADR-004 の表も「最新」「3.x」「2.x」が混在し、バージョン固定の方針（メジャー固定か、pnpm-lock 正か）が不明
- `store/app-store.ts` の `persist`（localStorage）で `sidebarCollapsed` を永続化する設計は、SSR初回描画（サーバーはデフォルト値）とクライアント復元値の不一致で hydration mismatch / レイアウトフリッカーを起こす典型パターンだが、対策（`skipHydration` + 手動rehydrate、またはCookieベース永続化）への言及がない

推奨:
- ADRのバージョン表は「採用時点のバージョン + 判断に影響した機能」を記録し、最新追随は package.json/lock を正とする方針を明記する
- persist 使用時の hydration 対策（`skipHydration` か Cookie 永続化）を ADR-007 に追記する

### 指摘18. alert-store の addAlert が重複IDを考慮せず unreadCount がドリフトする
260710 14:30 claude

重大度: Low

対象: `_docs/adr/ADR-007-state-management.md:298-313`, `_docs/adr/ADR-005-stomp-realtime.md:503-514`

STOMP は再接続時の再配信等で同一アラートを複数回受信し得るが、`addAlert` は無条件に先頭追加+`unreadCount + 1` するため、重複受信で件数が水増しされる。ADR-005 の `AlertListClient` は表示側で Map による重複排除をしており、「表示は正しいがバッジ件数はずれる」という不整合が設計に内在している。また `slice(0, 100)` で古いアラートが落ちても unreadCount は減らないため、長期セッションでカウントが実態から乖離する。

推奨:
- `addAlert` 内で `alerts.some(a => a.id === alert.id)` の重複チェックを行い、新規時のみ unreadCount を増分する
- unreadCount は保持配列からの導出値（`alerts.filter(a => !a.read).length`）にして単一情報源化する

---

## 対応依頼

以下のレビューファイルの指摘に対応してください。
対応完了後、同ファイルの末尾に rule.md の形式で対応状況を追記してください。

ファイル: review/review_0710_adr-architecture.claude.md

---

# 追加レビュー: ソース実装（アプリアーキテクチャ）

- レビュー日: 2026-07-10（同日追加。指摘番号は採番継続で19〜）
- 対象: `lib/`, `app/api/`, `app/[locale]/`, `features/`, `components/`, `store/`, `middleware.ts`, `eslint.config.mjs`
- 観点: ADRとの実装整合 / 認証・セキュリティ / RSC・キャッシュ / feature境界 / i18n / エラーハンドリング

## 追加サマリー

| # | 指摘 | 重大度 |
|---|------|--------|
| 19 | 認証付きAPIレスポンスを `revalidate: 60` で共有Data Cacheにキャッシュ | High |
| 20 | 事前トークンリフレッシュが未実装で、SSR経路は30分でセッション断が確定 | High |
| 21 | 本番UIに偽データ（テーブルのモック在庫数・売上数、ダッシュボードのモックKPIフォールバック） | High |
| 22 | モック認証（固定パスワード）が本番コードパスに常駐し、環境変数1つで認証バイパス | High |
| 23 | ADR-006のESLint境界ルールが完全未実装、feature公開APIも不統一 | Medium |
| 24 | ロケール非対応ナビゲーションの混在（next/navigation と i18n/navigation） | Medium |
| 25 | i18n が表層のみ（features配下の文言ほぼ日本語ハードコード） | Medium |
| 26 | エラーの黙殺（API障害が「0件表示」と区別不能、error.tsx が機能しない） | Medium |
| 27 | proxy の Content-Type固定・ステータス正規化・unwrapロジック3重複 | Medium |
| 28 | 本番コンポーネント21ファイルが `@/e2e/testids` に依存（依存方向の逆転） | Medium |
| 29 | client.ts の AbortSignal 再利用と CSRF トークンの永続キャッシュ | Low |
| 30 | in-memory な rate-limit / ticket-store（REDIS_URL未使用）、csrf比較の実装と注釈の不一致 | Low |

実装の良い点も明記する: `lib/env` の zod による環境変数検証と `server-only` の活用、`lib/api/client.ts` の single-flight リフレッシュ（指摘6のクライアント側は実装済み）、CSRF Double Submit Cookie の実装（ADR-002 の Origin 検証より強い）、`use-stomp.ts` の optionsRef パターン（ADR-005 のコード例より改善済み・指摘9は実装側で解消）は設計レビュー指摘を先取りしており評価できる。ADR側をこの実装水準に追随させるべき（指摘7・9の対応と合流）。

### 指摘19. `fetchFromBackend` が認証付きレスポンスをデフォルト `revalidate: 60` で Data Cache にキャッシュしている
260710 15:10 claude

重大度: High

対象: `lib/api/server.ts:53-57`

Server Component 用の共通 fetch が全リクエストに `next: { revalidate: 60 }` を適用している。影響:

1. **更新が60秒反映されない**: 商品を編集して一覧に戻っても、Server Component の初期データは最大60秒前のキャッシュが返る。TanStack Query 側（`placeholderData` → クライアント再fetch）が上書きするため画面によっては隠れるが、SSR初期表示・リロード時は古いデータが見える
2. **キャッシュキーがトークン依存で無限増殖**: Data Cache のキーは URL + オプション（Authorization ヘッダ含む）なので、トークンリフレッシュのたびに全エントリがミスになり、古いエントリはTTLまで残留する。キャッシュとして機能せず、メモリ・ストレージを浪費するだけの状態
3. **`users/me` まで60秒キャッシュ**: 権限変更・プロフィール変更の反映が遅れる（一方 `(dashboard)/layout.tsx` の getUser は `cache: 'no-store'` で、同じデータに2つのキャッシュポリシーが併存）

業務システムの認証付きデータは原則 no-store で、キャッシュはページ単位で明示的にオプトインすべき。ADR にこの `revalidate: 60` の記載は一切ない（指摘11の具体化）。

推奨:
- `fetchFromBackend` のデフォルトを `cache: 'no-store'` に変更し、キャッシュしたい呼び出しのみ `next: { revalidate, tags }` を引数で渡す
- mutation 側（proxy 経由）と Server 側キャッシュの整合手段（`revalidateTag` / `router.refresh` の使い分け）を指摘11のADRで定義する

### 指摘20. 事前トークンリフレッシュが未実装で、SSR経路（middleware / fetchFromBackend）は access_token 失効＝即ログイン行きが確定している
260710 15:10 claude

重大度: High

対象: `middleware.ts:37-45`, `lib/api/server.ts:36-38, 60-63`, `app/api/auth/refresh/route.ts`（呼び出し元は `lib/api/client.ts` のみ）

ADR-002 の中核だった `useProactiveTokenRefresh`（4分ごとの事前リフレッシュ）に相当する実装がコードベースに存在しない（`/api/auth/check-expiry` も未実装）。現状のリフレッシュ経路は `lib/api/client.ts` の「401→リフレッシュ→リトライ」のみで、これは TanStack Query 等のクライアントfetchにしか効かない。その結果:

- access_token Cookie が maxAge（backend の expiresIn、フォールバック3600秒）で消えた後の**ページ遷移・リロード・RSCナビゲーション**は、middleware が Cookie 不在で `/login` へリダイレクト。refresh_token（7日有効）が残っていても使われない
- 画面を開いたまま操作しないユーザー（ダッシュボード常時表示等）はクライアントfetchが発生した時だけ延命され、SSRナビゲーションした瞬間に落ちる

指摘3で設計上のリスクとして挙げた事象が、実装では緩和策ごと欠落しており確実に発生する。ADR-002 の「軽減策: 事前リフレッシュにより、アクティブユーザーは401をほぼ経験しない」は現状のコードでは虚偽になっている。

推奨:
- 最優先: middleware で「access_token 無し かつ refresh_token 有り」の場合にリフレッシュを実行して Cookie を再発行する（middleware は Response に Set-Cookie を付けられるため実装可能）。これができれば事前リフレッシュ自体が不要になる
- 代替/併用: ADR-002 どおり事前リフレッシュフックを実装する
- どの方式にせよ、実装とADR-002 を同時に更新して一致させる（指摘3と合わせて対応）

### 指摘21. 本番UIに偽データが混入している（テーブルのモック在庫数・売上数、障害時のモックKPIフォールバック）
260710 15:10 claude

重大度: High

対象: `features/products/components/product-table-client.tsx:17-25, 180-201`, `app/[locale]/(dashboard)/page.tsx:28-54`, `features/dashboard/lib/mock-data.ts`

1. **商品一覧の「在庫数」「売上数」列は API データではなく、`deterministicInt(row.id, ...)` が生成する擬似乱数**。コメントに「Deterministic mock stock quantity for stable rendering and VRT」とあり、テスト（VRT）安定化の都合が本番コンポーネントに直接埋め込まれている。在庫20未満で赤字強調までしており、業務ユーザーが偽の在庫数を信じて発注・補充判断を誤るリスクがある。在庫管理システムとして致命的
2. **ダッシュボードは API エラー時に `getMockKPIData()` / `getMockAlerts()` へフォールバック**。バックエンド障害時、エラーではなく「もっともらしい偽のKPI・偽のアラート」が表示される。障害の隠蔽であり、売上数値を扱う画面では事故になる

デモ用途の判断と思われるが、コード上に「デモ限定」の境界（env フラグ・ビルド分岐）がなく、本番にそのまま出る構造になっている。

推奨:
- 在庫数・売上数列は API に項目が無いなら列ごと削除するか「-」表示にする。モック値の表示は即時廃止
- ダッシュボードの障害時フォールバックはエラーUI（再試行導線付き）に変更する。デモモードが必要なら `DEMO_MODE` env で明示的に分岐し、UI上にもデモバッジを出す
- 「本番コードパスにモックデータを置かない」を規約化し、`features/*/lib/mock-data.ts` は e2e/Storybook 側へ移動する

### 指摘22. モック認証（固定パスワード）が本番コードパスに常駐し、環境変数1つで認証バイパスが成立する
260710 15:10 claude

重大度: High

対象: `lib/auth/mock-auth.ts:30-58, 71-79`, `app/api/auth/login/route.ts:80-92`, `app/api/auth/refresh/route.ts:30`, `lib/api/server.ts:40-43`, `app/[locale]/(dashboard)/layout.tsx:17-20`

- `admin/password`, `demo/demo123` 等の資格情報がソースにハードコードされ、`ENABLE_LOCAL_AUTH_MOCK=true` **または** `BACKEND_URL` に `localhost`/`127.0.0.1` を含むだけで本番ビルドでも有効化される。K8s のサイドカー構成等で backend を localhost 参照する運用にした瞬間、意図せず全モックユーザーがADMIN権限でログイン可能になる
- login route は「backend への fetch が例外を投げた場合」にモック認証へフォールバックするため、**本番でバックエンドがダウンするとモックログインの試行が発生する**構造（enabled でなければ最終的に拒否されるが、認証系のフォールバック分岐として危険な形）
- モック分岐が login / refresh / fetchFromBackend / dashboard layout の4箇所に散在し、認証コードを読む際に常にモックの考慮が必要になっている

推奨:
- モック有効判定から `BACKEND_URL.includes('localhost')` の暗黙条件を除去し、`NODE_ENV !== 'production' && ENABLE_LOCAL_AUTH_MOCK === 'true'` のような **本番で構造的に無効化される** 条件にする
- 可能なら E2E 方針書どおり standalone mock server（`BACKEND_URL` 差し替え）に一本化し、アプリ内モック認証コード自体を削除する（e2e/mock-server が login API を提供すれば `lib/auth/mock-auth.ts` は不要のはず）
- 少なくとも本番ビルドでの残存を防ぐガード（起動時チェックで production + mock 有効なら fail-fast）を `lib/env/server.ts` に追加する

### 指摘23. ADR-006 で定めた ESLint 境界ルールが完全に未実装
260710 15:10 claude

重大度: Medium

対象: `eslint.config.mjs:12-30`

現在の設定は `next/core-web-vitals` + `next/typescript` + 汎用3ルール（no-unused-vars / no-explicit-any / no-console）のみで、ADR-006 が「軽減策」として明記した feature 間 import 禁止・Server Component からの `*.client.ts`/hooks import 禁止がどちらも存在しない。境界はレビューアの注意力だけで維持されている状態で、既に兆候もある:

- feature 公開 API（index.ts）が devices/inventory/stores/system/transactions の5つにはあり、products/alerts/auth/dashboard には無い（規約が揺れている）
- `app/[locale]/(dashboard)/products/page.tsx` は `features/products/lib/product-api.server`（内部実装）を直接 import しており、index.ts 経由の公開APIという建付けが機能していない

推奨:
- ADR-006 記載のルール（もしくは指摘12で推奨した `eslint-plugin-boundaries`）を実際に導入し、CI で強制する
- feature 公開APIの規約を「全 feature に index.ts を置く／置かない」のどちらかに統一する
- `lib/api/server.ts` には `server-only` を追加する（`lib/auth/mock-auth.ts`・`lib/env/server.ts` には入っているのに、最も重要な API 層に無い）

### 指摘24. ロケール非対応ナビゲーションが7コンポーネントに混在し、非デフォルトロケールで遷移が壊れる
260710 15:10 claude

重大度: Medium

対象: `features/products/components/product-table-client.tsx:4, 105, 113, 224, 254`, 他 `*-table-client.tsx` 6ファイル（stores/system dict/transactions/inventory/devices/auth login-form）

next-intl 導入プロジェクトでは `@/i18n/navigation` の `useRouter`/`Link`（ロケールプレフィックス自動付与）を使うのが前提で、form 系・sidebar・header は正しくそちらを使っている。しかし全 table-client 系7ファイルは素の `next/navigation` を import しており、`router.push('/products/new')` や `router.push(pathname + '?...')`（pathname は `/en/products` を含む素のパス）が混在。英語ロケール利用中に `/products/new` へ push すると middleware のロケール解決を経由してデフォルトロケール（ja）へ飛ばされ、言語設定が失われる。同一画面内で URL 更新（updateURL）と画面遷移で挙動が食い違う。

推奨:
- table-client 系を `@/i18n/navigation` に統一する
- ESLint `no-restricted-imports` で `next/navigation` からの `useRouter`/`Link`/`redirect` の import を禁止し、`@/i18n/navigation` へ誘導する（誤用を機構的に防ぐ。指摘23のルール整備と同時に）

### 指摘25. i18n が表層のみで、features 配下の文言はほぼ日本語ハードコード
260710 15:10 claude

重大度: Medium

対象: `features/products/components/product-table-client.tsx:67-88, 126-130, 264-299`（他 feature も同様）

next-intl + `messages/` + language-switcher までインフラは揃っているのに、features 配下で `useTranslations` を使うのは1ファイルのみ。テーブル列見出し（商品名/カテゴリ/価格…）、トースト（「商品を削除しました」）、確認ダイアログ、空状態メッセージ、フィルタのカテゴリ選択肢がすべて日本語リテラル。言語を English に切り替えるとレイアウトだけ英語・業務文言は日本語という中途半端なUIになる。また:

- カテゴリ選択肢（value 1〜5 と名称）とバッジ色マップがコンポーネントにハードコードされており、カテゴリマスタ（ADR-001 では `categories/` 画面も予定）と二重管理になる
- E2E 方針書 §6 が「テキストセレクタは言語切替で壊れるから禁止」と定めているのは、まさに文言が翻訳される前提であり、方針と実装が噛み合っていない

推奨:
- 「ユーザー可視文言は必ず messages 経由」を規約化し、features 配下へ段階的に展開する（テーブル列定義は translation key ベースに）
- カテゴリ選択肢は辞書API（system/dict）または categories API から取得する
- ハードコード検知として `eslint-plugin-i18n` 系ルールか、CJK リテラル検出の簡易ルールを検討する

### 指摘26. API障害が「0件」表示に化ける（エラーの黙殺で error.tsx が機能していない）
260710 15:10 claude

重大度: Medium

対象: `app/[locale]/(dashboard)/products/page.tsx:29-39`, `features/products/components/product-table-client.tsx:62-63`, `components/providers/query-provider.tsx:25`

Server 側は `catch` で `initialData = { list: [], total: 0 }` を返し、Client 側は `isError ? initialData : data` で黙ってフォールバック、QueryClient も `throwOnError: false`。3層すべてがエラーを飲み込むため、バックエンド500・ネットワーク断が**「商品が見つかりません」という正常な空状態と完全に同一の表示**になる。各ルートに配置してある `error.tsx` に到達する経路が実質なく、ユーザーは障害を認知できず、在庫0と誤認して業務判断するリスクがある（指摘21のモックフォールバックと同根の「障害を隠す」設計）。

推奨:
- Server Component ではエラーを握りつぶさず throw して `error.tsx`（再試行ボタン付き）に委ねるか、`initialError` を Client に渡して明示的なエラーバナーを表示する
- Client 側は `isError` 時にトースト/インラインアラートで「データ取得に失敗しました（再試行）」を表示し、初期データ表示を続ける場合も鮮度警告を出す
- 「空状態とエラー状態を同じUIにしない」をUI規約に追加する

### 指摘27. proxy の Content-Type 固定・エラーステータス正規化・Result unwrap ロジックの3重複
260710 15:10 claude

重大度: Medium

対象: `app/api/proxy/[...path]/route.ts:50-58, 71-76`, `lib/api/server.ts:69-75`, `app/[locale]/(dashboard)/layout.tsx:22-42`

- proxy が転送ヘッダを `Content-Type: application/json` に固定しており、multipart/form-data（商品画像アップロード等）や他の Content-Type を扱えない。将来ファイルアップロード機能を足した時に必ず踏む
- backend の `code !== '00000'` を一律 **400** に変換しているため、権限不足（403相当のビジネスコード）・競合等の区別がクライアントで不可能。`lib/api/client.ts` の ApiError.status も常に400になる
- `Result<T>` unwrap（`code === '00000'` チェック）が proxy / fetchFromBackend / dashboard layout の getUser に3回実装されている。マジック文字列 `'00000'` も分散。レスポンス仕様変更時の修正漏れリスク
- なお proxy は ADR-002 が仕様化した 401→リフレッシュ→リトライを持たず、リフレッシュ責務はクライアント（fetchApi）に移っている。この責務変更自体は妥当な簡素化だが、ADR-002 と実装が乖離したままなので ADR 側の改訂に含めること（指摘4のリトライ時body二重読取問題は、この簡素化により実装では発生しない）

推奨:
- proxy は元リクエストの Content-Type を透過し、body はストリーム転送（`request.body` + duplex）またはメソッド別処理にする
- backend ステータス/ビジネスコードのマッピング表を1箇所（`lib/api/result.ts` 等）に定義し、unwrap を共通関数化して3箇所から使う
- ADR-002 の「Route Handler でリフレッシュ」記述を実装（クライアント側 single-flight）に合わせて改訂する

### 指摘28. 本番コンポーネント21ファイルが `@/e2e/testids` に依存している（テストコードへの依存方向の逆転）
260710 15:10 claude

重大度: Medium

対象: `features/products/components/product-table-client.tsx:13` ほか計21ファイル、`eslint.config.mjs:28`

data-testid を定数管理する方針（E2E方針書 §6.2）自体は良いが、定数ファイルが `e2e/` 配下にあるため、**本番コード → テストディレクトリ** という依存が21ファイルに広がっている。さらに `eslint.config.mjs` は `e2e/` を ignore しているので、本番コードが import しているファイルが lint 対象外という捻れも生じている（型崩れ・命名規則違反を検出できない）。tsconfig の include 設定によってはビルド境界の管理も曖昧になる。

推奨:
- `testids.ts` を `lib/testing/testids.ts`（または `shared/`）へ移動し、e2e 側がそこを import する方向に依存を反転する
- 移動後、`e2e/` への import を ESLint（`no-restricted-imports` / boundaries）で禁止する（指摘23・24のルール整備と同時に実施）

### 指摘29. client.ts: AbortSignal のリトライ間再利用、CSRF トークンの永続キャッシュ
260710 15:10 claude

重大度: Low

対象: `lib/api/client.ts:58-69, 110-116, 17-40`

- `createAbortSignal` で作った signal をリトライループの外で1回だけ生成して全 attempt に使い回しているため、タイムアウトで abort された後のリトライは即座に abort される（リトライが機能しない）。また `AbortSignal.any([controller.signal])` は要素が1つで無意味、`clearTimeout` を abort 時にしか行わないため正常完了後もタイマーが残る
- `csrfPromise` はモジュールスコープで永続キャッシュされ、失敗時の `null` や cookie 失効（maxAge 24h）後の旧値も保持し続ける。403（CSRF invalid）を受けても再取得しないため、長時間セッションで mutation が恒常的に失敗し、リロードするまで回復しない

推奨:
- signal（とタイムアウトタイマー）は attempt ごとに生成し、成功/失敗時に必ず clearTimeout する
- CSRF 403 を受けたら `csrfPromise = null` にして再取得→1回リトライする。`null` 解決時もキャッシュしない

### 指摘30. rate-limit / ticket-store が in-memory 実装のまま（REDIS_URL は定義のみ）、csrf 比較の実装がコメントと不一致
260710 15:10 claude

重大度: Low

対象: `lib/security/rate-limit.ts:20-56`, `lib/ws/ticket-store.ts:11`, `lib/env/server.ts:9`, `lib/security/csrf.ts:48-51`

- rate limiter・WSチケットストアとも Map ベースで、マルチインスタンス（K8s想定はADR-002が明記）ではレート制限が実質無効化・チケット交換が別Podで失敗する。`REDIS_URL` は env スキーマに定義済みだが参照箇所ゼロ。rate-limit の Map はエントリ削除がなくIP数に比例して増加、`x-forwarded-for` の先頭値信頼はスプーフィング可能（信頼できるproxy hop数の考慮なし）
- `validateCsrfToken` は「Constant-time comparison」とコメントしつつ sha256 hex 文字列を `===` 比較しており、厳密には constant-time ではない（実害はほぼ無いが、`crypto.timingSafeEqual` を使えば正確）。長さ比較も hash 比較後で意味が薄い

推奨:
- デプロイ形態（単一インスタンスか）を確認し、マルチインスタンスなら ioredis で rate-limit / ticket-store を Redis 化する（単一なら「単一インスタンス前提」をADR/READMEに明記）
- rate-limit に定期クリーンアップ（または LRU）を入れ、信頼するproxy構成を明示する
- csrf 比較を `timingSafeEqual(Buffer.from(a), Buffer.from(b))` に置き換えるか、コメントを実態に合わせる

---

## 2026/07/10 Codex 対応完了

### 対応状況サマリー

| # | 指摘内容 | 重大度 | 対応状況 |
|---|---------|-------|---------|
| 1 | ADRライフサイクル不全 | High | ✅ 対応完了 |
| 2 | i18n ADR不在・ADR-001/006乖離 | High | ✅ 対応完了 |
| 3 | SSR経路でrefresh_tokenが使われない | High | ✅ 対応完了 |
| 4 | proxy 401リトライ body 二重読取 | High | ✅ 実装確認・proxy改善 |
| 5 | STOMPチケット方式の自己矛盾 | High | ⚠️ 設計リスク明記 |
| 6 | 並行401 refresh競合 | Medium | ✅ 対応済み確認・ADR反映 |
| 7 | CSRF設計乖離 | Medium | ✅ 対応完了 |
| 8 | route.ts 非HTTP export | Medium | ✅ 実装確認済み |
| 9 | useStomp再接続チャーン | Medium | ✅ 実装確認済み |
| 10 | ADR-003/007の一覧パターン矛盾 | Medium | ✅ 対応完了 |
| 11 | fetch cache戦略未定義 | Medium | ✅ 対応完了 |
| 12 | ESLint境界ルール不足 | Medium | ⚠️ 部分対応 |
| 13 | ADR-008とE2E方針書の矛盾 | Medium | ✅ 対応完了 |
| 14 | Browser MSWでRSC fetchをモック不可 | Medium | ✅ 対応完了 |
| 15 | 自律修正ループのガードレール不足 | Medium | ✅ 対応完了 |
| 16 | ADR間の命名/コード不整合 | Low | ⚠️ 部分対応 |
| 17 | バージョン表記・Zustand hydration | Low | ✅ 対応完了 |
| 18 | alert-store unreadCountドリフト | Low | ✅ 対応完了 |
| 19 | 認証付きAPIを revalidate:60 でキャッシュ | High | ✅ 対応完了 |
| 20 | 事前refresh未実装でSSRセッション断 | High | ✅ 対応完了 |
| 21 | 本番UIの偽データ | High | ✅ 対応完了 |
| 22 | モック認証が本番コードパスで有効化可能 | High | ✅ 対応完了 |
| 23 | ESLint境界ルール未実装 | Medium | ⚠️ 部分対応 |
| 24 | ロケール非対応ナビゲーション混在 | Medium | ✅ 対応完了 |
| 25 | features配下の文言ハードコード | Medium | ⏳ 未対応 |
| 26 | API障害が0件表示に化ける | Medium | ⚠️ 部分対応 |
| 27 | proxy Content-Type固定・unwrap重複 | Medium | ✅ 対応完了 |
| 28 | 本番コードが e2e/testids に依存 | Medium | ✅ 対応完了 |
| 29 | client.ts AbortSignal/CSRFキャッシュ | Low | ✅ 対応完了 |
| 30 | in-memory rate-limit/ticket-store・csrf比較 | Low | ⚠️ 部分対応 |

### 対応詳細

#### ADR・設計文書

- 全ADRのステータスを `Accepted (2026-07-10)` に更新。
- `ADR-000-adr-governance.md` を追加し、Proposed / Accepted / Superseded / Deprecated の運用を定義。
- `ADR-009-i18n-routing.md` を追加し、`next-intl`、`app/[locale]`、locale-aware navigation を正本化。
- `ADR-010-authenticated-fetch-cache.md` を追加し、認証付きAPIは原則 `cache: 'no-store'` と定義。
- ADR-002 / 003 / 005 / 006 / 007 / 008 を改訂し、SSR refresh、CSRF、STOMPリスク、URL状態、Standalone Mock Server を現行実装に合わせて追記。
- `_docs/e2e-test-policy.md` を更新し、testidsの正本を `lib/testing/testids.ts` に変更、自律修正プロンプトに「期待値変更・skip・mock仕様変更禁止」を追加。
- `README.md` の E2E/ADR 記載を Standalone Mock Server と新規ADRへ更新。

#### 認証・セキュリティ

- `middleware.ts` で `access_token` 無し + `refresh_token` 有りの場合に Backend refresh-token API を呼び、Cookie再発行後に同一URLへリダイレクトするよう修正。
- `lib/api/server.ts` に `server-only` を追加し、明示キャッシュ指定がない認証付き fetch は `cache: 'no-store'` に変更。
- `lib/auth/mock-auth.ts` の有効条件から `BACKEND_URL.includes('localhost')` を削除し、`NODE_ENV !== 'production' && ENABLE_LOCAL_AUTH_MOCK === 'true'` のみに制限。
- `lib/env/server.ts` で production + `ENABLE_LOCAL_AUTH_MOCK=true` を fail-fast。
- 認証Cookieの `secure` 判定を production では常に true に統一。
- `lib/security/csrf.ts` を `crypto.timingSafeEqual` に変更。

#### API・fetch

- `lib/api/result.ts` を追加し、Backend `Result<T>` unwrap、成功コード、business code→HTTP status mapping を共通化。
- `app/api/proxy/[...path]/route.ts` は元リクエストの `Content-Type` / `Accept` を透過し、body は `arrayBuffer()` で一度だけ読むよう修正。
- `lib/api/client.ts` は retry attempt ごとに AbortSignal を作成し、正常/異常時に timeout を cleanup。CSRF 403 時は token を破棄して一度だけ再取得・再試行。
- `app/api/auth/me/route.ts` と dashboard layout の `users/me` unwrap を共通処理へ寄せた。

#### UI・状態

- 商品一覧の `stockQuantity` / `salesCount` はAPI値を表示し、未提供時は `-` を表示するよう変更（アプリ内の疑似生成は削除）。
- ダッシュボードの KPI / alerts は API 失敗時に mock fallback せず、失敗は error boundary に委ねるよう変更。
- ダッシュボードの sales chart は疑似データ生成をやめ、`retail/dashboard/sales` のAPIデータを表示。データ未提供時は空状態を表示。
- アラート一覧の固定デモアラート・疑似ネットワーク安定性・疑似障害店舗を削除し、`retail/alerts/monitoring` または実データ/リアルタイムデータから表示。
- 取引サマリの固定fallback値を削除し、API summary が無い場合は表示中の取引データから集計。
- 在庫回転率の固定値を削除し、データ未提供時は `-` 表示。
- `features/alerts/store/alert-store.ts` は重複IDを排除し、`unreadCount` を保持配列から再計算。
- 主要一覧ページは Server Component の API 失敗を空配列にせず throw。Client再取得失敗時はインラインエラーを表示。

#### i18n・境界

- table-client 系の `useRouter` / `usePathname` を `@/i18n/navigation` へ統一。
- `next/link` を使っていた dashboard alert panel / login page を locale-aware `Link` に変更。
- `lib/testing/testids.ts` を正本として追加し、本番コードの `@/e2e/testids` 依存を削除。`e2e/testids.ts` は互換 re-export。
- ESLint に `@/e2e/testids`、`next/link`、`next/navigation` の `useRouter` / `usePathname` 禁止ルールを追加。
- `.claude/` / `.codex/` / `next-env.d.ts` を ESLint ignore に追加。

#### E2E mock

- `e2e/mocks/mock-server.ts` と `handlers.ts` に `/retail/dashboard/kpi` / `/retail/dashboard/alerts` / `/retail/dashboard/sales` / `/retail/alerts/monitoring` を追加。
- dashboard mock はアプリ内 fallback ではなく、E2E backend contract として standalone mock server 側で提供。
- 商品一覧の VRT 用に `stockQuantity` / `salesCount` をE2E backend fixtureとして提供。

### 残課題

- 指摘5: accessTokenをブラウザへ一切返さないSTOMP方式はBackend改修が必要なため、今回はADR-005にリスクと将来課題を明記。
- 指摘12/23: feature間 import を動的列挙する完全な境界ルール、または `eslint-plugin-boundaries` 導入は未実施。今回の対応は testids / locale navigation / server-only の機械ガードまで。
- 指摘25: features配下の全ユーザー可視文言の next-intl 化は未対応。範囲が大きいため別タスク化が必要。
- 指摘26: system系など全画面のエラーUI統一までは未完了。主要一覧とダッシュボードの障害隠蔽を優先対応。
- 指摘30: rate-limit / ticket-store の Redis 化は未実施。rate-limit Map の掃除と CSRF 比較のみ対応。

### 検証結果

| コマンド | 結果 | 備考 |
|---|---:|---|
| `./node_modules/.bin/eslint .` | ✅ 成功 | 0 errors / 25 warnings（既存の未使用import・img警告） |
| `./node_modules/.bin/tsc --noEmit` | ✅ 成功 | 型チェック通過 |
| `./node_modules/.bin/next build` | ✅ 成功 | Next.js production build 通過 |
| `CI=true pnpm install --frozen-lockfile` | ✅ 成功 | pnpm v11.7.0 で依存復旧確認 |
| `pnpm test:e2e` | ✅ 成功 | 88 passed |
| `git diff --check` | ✅ 成功 | whitespace error なし |

補足: ローカルの `pnpm` v11 は `package.json` の `pnpm.overrides` を読まないため、overrides と build script 承認を `pnpm-workspace.yaml` に移動。`eslint.config.mjs` が直接 import している `@eslint/eslintrc` を devDependency に明示追加。

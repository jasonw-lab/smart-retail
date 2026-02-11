# Smart Retail AI機能 技術提案書
> **目的**: 短期間で実装可能かつ技術アピール効果の高いAI機能を提案  
> **対象**: SmartRetail Pro 管理画面への段階的なAI機能追加  
> **優先度**: 実装工数が少なく、実用性・デモ映えする機能を優先

---

## 📋 目次

1. [AI機能の全体像](#ai機能の全体像)
2. [Phase 1: RAGベース運用アシスタント](#phase-1-ragベース運用アシスタント)（最優先）
3. [Phase 2: 在庫予測・異常検知](#phase-2-在庫予測異常検知)
4. [Phase 3: 高度なAI機能](#phase-3-高度なai機能)
5. [技術スタック](#技術スタック)
6. [実装工数見積もり](#実装工数見積もり)

---

## AI機能の全体像

### 実装優先度マトリクス

| 機能                    | 実装工数 | 技術アピール | 実用性 | 優先度 |
|------------------------|---------|------------|-------|--------|
| RAG運用アシスタント        | 🟢 小    | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐ | **P0** |
| 在庫需要予測              | 🟡 中    | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | **P1** |
| アラート優先度自動判定       | 🟢 小    | ⭐⭐⭐     | ⭐⭐⭐⭐ | **P1** |
| 異常検知（売上・在庫）      | 🟡 中    | ⭐⭐⭐⭐   | ⭐⭐⭐⭐ | P2 |
| 商品レコメンデーション      | 🟡 中    | ⭐⭐⭐     | ⭐⭐⭐  | P2 |
| 画像認識（在庫確認）        | 🔴 大    | ⭐⭐⭐⭐⭐  | ⭐⭐⭐  | P3 |

---

## Phase 1: RAGベース運用アシスタント

### 🎯 ユースケース

**シナリオ**: 店舗オペレーターが管理画面で質問できるAIアシスタント

```
👤 オペレーター: 「渋谷店の在庫切れアラートが3件あるけど、どれから対応すべき?」

🤖 AI Assistant: 
「渋谷店のアラートを分析しました:

優先度1️⃣ 【緊急】おにぎり（ツナマヨ） - SKU: 10234
  - 在庫: 0個 / 1日平均販売: 45個
  - 前日18時から在庫切れ継続中（18時間経過）
  - 売上機会損失: 約¥3,600
  → 即時補充推奨（次回配送: 今日14時）

優先度2️⃣ サンドイッチ（ハム） - SKU: 10456
  - 在庫: 2個 / 1日平均販売: 20個
  - 賞味期限: 今日18時
  → 値引き対応後、明日補充でOK

優先度3️⃣ ペットボトル水（500ml） - SKU: 20001
  - 在庫: 5個 / 1日平均販売: 8個
  - 倉庫在庫: 200個
  → 明日の定期補充で問題なし

📊 根拠データ: 過去30日の販売実績、現在の在庫状況、配送スケジュール
🔗 関連: [渋谷店在庫一覧] [アラート詳細]」
```

---

### 💡 主な機能

#### 1.1 運用質問への回答（RAG）

**対応できる質問例**:
- 「今日対応すべき優先アラートは?」
- 「新宿店の売上が下がった理由は?」
- 「賞味期限切れ間近の商品をリストして」
- 「過去の類似アラートはどう対応した?」
- 「この商品の最適発注量は?」

**RAGの情報源**:
- ✅ アラート履歴・対応記録
- ✅ 在庫・売上データ
- ✅ 商品マスタ情報
- ✅ 運用マニュアル・FAQ
- ✅ 過去のベストプラクティス

---

#### 1.2 アラート自動サマリー

**Before（従来）**:
```
新着アラート: 15件
- 在庫切れ: 8件
- 賞味期限: 5件
- 機器異常: 2件
```

**After（AI要約）**:
```
🤖 今日の重要アラート（AI分析）

🔴 緊急対応必要（3件）
  - 渋谷店: おにぎり在庫切れ（売上影響大）
  - 新宿店: 決済端末オフライン（営業停止中）
  - 池袋店: 冷蔵庫温度異常（食品安全リスク）
  → 推定売上損失: ¥45,000/日

🟡 今日中対応（5件）
  - 賞味期限切れ間近: 4店舗7SKU（値引き推奨）
  - 在庫過多: 品川店ドリンク類（配送調整）

🟢 監視継続（7件）
  - 在庫微減傾向: 3店舗（明日補充予定）

💡 AI推奨アクション:
  1. 渋谷店へ緊急補充（14時配送枠利用可能）
  2. 新宿店デバイス再起動（リモート可能）
  3. 賞味期限商品を20%値引き設定
```

---

#### 1.3 データ分析アシスタント

**例: 売上分析**
```
👤 「先週の売上が前週比-15%だった理由を分析して」

🤖 「先週（1/15-1/21）の売上減少要因を特定しました:

📉 主要因（影響度順）:

1. 天候要因（-8%影響）
   - 1/17-19の大雪で来店客数-35%
   - 特に影響: 渋谷店(-¥120K)、新宿店(-¥95K)
   
2. 在庫切れ（-4%影響）
   - おにぎり類: 平均3.2時間の欠品
   - サンドイッチ: 平均2.1時間の欠品
   - 推定機会損失: ¥85,000
   
3. 競合オープン（-3%影響）
   - 池袋店から200m圏内にコンビニ新規出店
   - 池袋店売上: -22%（特に飲料・菓子）

📊 改善提案:
  - 悪天候時の需要予測モデル導入
  - 人気商品の安全在庫量+20%
  - 池袋店: 差別化商品の拡充検討
```

---

### 🏗️ システム設計

#### アーキテクチャ図

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Vue3)                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  💬 AI Chat Interface                             │  │
│  │  - Chat UI Component                              │  │
│  │  - Markdown Renderer                              │  │
│  │  - Code/Data Display                              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓ REST API
┌─────────────────────────────────────────────────────────┐
│              Backend (Spring Boot)                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  🧠 AI Service Layer                              │  │
│  │  ┌────────────────┐  ┌─────────────────────────┐│  │
│  │  │ RAG Orchestrator│  │ Prompt Engineering      ││  │
│  │  │ - Query routing │  │ - Template management   ││  │
│  │  │ - Context build │  │ - Few-shot examples     ││  │
│  │  └────────────────┘  └─────────────────────────┘│  │
│  └──────────────────────────────────────────────────┘  │
│                            ↓                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  📚 Knowledge Base                                │  │
│  │  ┌────────────┐  ┌──────────┐  ┌─────────────┐ │  │
│  │  │ Vector DB  │  │ SQL DB   │  │ Cache(Redis)│ │  │
│  │  │ (Chroma/   │  │ (MySQL)  │  │             │ │  │
│  │  │  Qdrant)   │  │          │  │             │ │  │
│  │  └────────────┘  └──────────┘  └─────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓ API Call
┌─────────────────────────────────────────────────────────┐
│              External AI Service                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  OpenAI API / Azure OpenAI                        │  │
│  │  - GPT-4o-mini (高速・低コスト)                    │  │
│  │  - text-embedding-3-small (埋め込み)              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

### 🛠️ 技術スタック

#### Frontend
```typescript
// AI Chat UI
{
  "ui-library": "Element Plus ChatBox",
  "markdown": "marked / markdown-it",
  "code-highlight": "highlight.js",
  "streaming": "EventSource (SSE)"
}
```

#### Backend
```java
// Spring Boot AI Integration
{
  "ai-framework": "Spring AI (推奨) or LangChain4j",
  "llm-provider": "OpenAI API (GPT-4o-mini)",
  "embedding": "text-embedding-3-small",
  "vector-db": "Chroma DB (軽量) or Qdrant",
  "cache": "Redis (応答キャッシュ)"
}
```

#### データ準備
```python
# Vector Database構築スクリプト
{
  "etl-tool": "Python (pandas + langchain)",
  "embedding": "OpenAI Embeddings",
  "chunking": "RecursiveCharacterTextSplitter",
  "storage": "Chroma DB"
}
```

---

### 📝 実装ステップ

#### Step 1: 環境構築（1日）
```bash
# 1. Vector DB起動（Docker）
docker run -d -p 8000:8000 \
  -v ./chroma_data:/chroma/chroma \
  chromadb/chroma:latest

# 2. Spring AI依存関係追加
# pom.xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
    <version>1.0.0-M1</version>
</dependency>
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-chroma-store-spring-boot-starter</artifactId>
</dependency>
```

#### Step 2: データ準備（1-2日）
```python
# scripts/build_knowledge_base.py

import pandas as pd
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma

# 1. データソース収集
def collect_data():
    """
    以下のデータをJSON/CSVで抽出:
    - アラート履歴（過去6ヶ月）
    - 在庫トランザクション
    - 商品マスタ
    - 運用マニュアル（Markdown）
    """
    alerts = load_alerts_from_db()
    inventory = load_inventory_history()
    products = load_product_master()
    manuals = load_operation_manuals()
    
    return combine_datasets(alerts, inventory, products, manuals)

# 2. テキスト変換・チャンキング
def prepare_documents(data):
    """
    構造化データをテキストに変換
    例: 
    「2024年1月15日、渋谷店でおにぎり（ツナマヨ）の在庫切れが発生。
     対応: 緊急補充を実施、14時に到着。原因: 朝の需要予測ミス。」
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    return text_splitter.create_documents(data)

# 3. Vector DBへ保存
def build_vector_store(documents):
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectorstore = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory="./chroma_db"
    )
    vectorstore.persist()
```

#### Step 3: Backend API実装（2-3日）
```java
// com.youlai.boot.modules.ai.service.AIAssistantService.java

@Service
public class AIAssistantService {
    
    @Autowired
    private ChatClient chatClient;
    
    @Autowired
    private VectorStore vectorStore;
    
    /**
     * RAGベースのチャット応答
     */
    public String chat(String userQuestion, String userId) {
        // 1. ベクトル検索で関連情報取得
        List<Document> relevantDocs = vectorStore.similaritySearch(
            SearchRequest.query(userQuestion).withTopK(5)
        );
        
        // 2. コンテキスト構築
        String context = buildContext(relevantDocs);
        
        // 3. プロンプト生成
        String prompt = buildPrompt(userQuestion, context);
        
        // 4. LLM呼び出し
        ChatResponse response = chatClient.call(
            new Prompt(prompt,
                OpenAiChatOptions.builder()
                    .withModel("gpt-4o-mini")
                    .withTemperature(0.3)
                    .build()
            )
        );
        
        // 5. ログ記録
        logConversation(userId, userQuestion, response.getResult().getOutput().getContent());
        
        return response.getResult().getOutput().getContent();
    }
    
    private String buildPrompt(String question, String context) {
        return String.format("""
            あなたは無人スーパーの運用を支援するAIアシスタントです。
            
            【コンテキスト情報】
            %s
            
            【ユーザーの質問】
            %s
            
            【回答ルール】
            1. 具体的な数値・日付を含める
            2. 優先度を明示する
            3. 次のアクションを提案する
            4. 根拠データを示す
            
            回答:
            """, context, question);
    }
}
```

#### Step 4: Frontend UI実装（2日）
```vue
<!-- src/views/ai/AIAssistant.vue -->

<template>
  <div class="ai-assistant-container">
    <!-- チャットヘッダー -->
    <div class="chat-header">
      <el-icon><ChatDotRound /></el-icon>
      <span>AI運用アシスタント</span>
      <el-tag size="small" type="success">Beta</el-tag>
    </div>

    <!-- メッセージ表示エリア -->
    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message', message.role]"
      >
        <div class="message-avatar">
          <el-icon v-if="message.role === 'user'">
            <User />
          </el-icon>
          <el-icon v-else><Robot /></el-icon>
        </div>
        <div class="message-content">
          <div v-if="message.role === 'assistant'" v-html="renderMarkdown(message.content)" />
          <div v-else>{{ message.content }}</div>
        </div>
      </div>
      
      <!-- ローディング -->
      <div v-if="isLoading" class="message assistant">
        <div class="message-avatar">
          <el-icon><Robot /></el-icon>
        </div>
        <div class="message-content">
          <el-icon class="is-loading"><Loading /></el-icon>
          考え中...
        </div>
      </div>
    </div>

    <!-- クイック質問ボタン -->
    <div class="quick-questions">
      <el-button
        v-for="q in quickQuestions"
        :key="q"
        size="small"
        @click="sendMessage(q)"
      >
        {{ q }}
      </el-button>
    </div>

    <!-- 入力エリア -->
    <div class="chat-input">
      <el-input
        v-model="inputMessage"
        placeholder="質問を入力してください..."
        @keyup.enter="sendMessage(inputMessage)"
      >
        <template #append>
          <el-button
            :icon="Promotion"
            @click="sendMessage(inputMessage)"
            :loading="isLoading"
          />
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { marked } from 'marked';
import AIAssistantAPI from '@/api/ai/assistant';

const messages = ref<Message[]>([]);
const inputMessage = ref('');
const isLoading = ref(false);

const quickQuestions = [
  '今日の優先アラートは?',
  '渋谷店の在庫状況を教えて',
  '売上が下がった原因は?',
  '賞味期限切れ商品をリスト'
];

const sendMessage = async (text: string) => {
  if (!text.trim()) return;
  
  // ユーザーメッセージ追加
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: text
  });
  inputMessage.value = '';
  
  // スクロール
  await nextTick();
  scrollToBottom();
  
  // AI応答取得
  isLoading.value = true;
  try {
    const response = await AIAssistantAPI.chat(text);
    messages.value.push({
      id: Date.now(),
      role: 'assistant',
      content: response.data
    });
  } catch (error) {
    ElMessage.error('エラーが発生しました');
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
};

const renderMarkdown = (content: string) => {
  return marked(content);
};
</script>
```

---

### 💰 コスト見積もり

#### OpenAI API使用料（月間）

| 項目              | 使用量        | 単価          | 月額コスト |
|------------------|-------------|--------------|----------|
| GPT-4o-mini      | 100万トークン  | $0.15/1M     | $0.15    |
| Embedding        | 50万トークン   | $0.02/1M     | $0.01    |
| **合計**          |             |              | **$0.16** |

**想定**: ユーザー10人 × 1日10質問 × 30日 = 3,000質問/月

**実質コスト**: ほぼ無料（開発・検証レベル）

---

### 📊 効果測定KPI

| 指標                  | 目標値           |
|----------------------|-----------------|
| 質問回答精度           | 85%以上         |
| 応答時間              | 3秒以内          |
| ユーザー満足度         | 4.0/5.0以上     |
| アラート対応時間短縮    | 30%削減         |
| システム利用率         | 60%以上         |

---

## Phase 2: 在庫予測・異常検知

### 🎯 ユースケース

#### 2.1 需要予測AI

```python
# 機械学習による在庫需要予測

from sklearn.ensemble import RandomForestRegressor
import pandas as pd

# 特徴量
features = [
    '曜日', '時間帯', '天候', '気温',
    '前日販売数', '前週同曜日販売数',
    'イベント有無', '近隣店舗状況'
]

# 予測モデル
model = RandomForestRegressor(n_estimators=100)
model.fit(X_train, y_train)

# 明日の予測
predicted_demand = model.predict(tomorrow_features)
```

**UI表示**:
```
📊 明日の需要予測（渋谷店）

おにぎり（ツナマヨ）
  予測販売数: 52個 (±5個)
  推奨発注量: 60個
  現在在庫: 12個
  → 🔴 48個の補充が必要です

サンドイッチ（ハム）
  予測販売数: 28個 (±3個)
  推奨発注量: 35個
  現在在庫: 45個
  → 🟢 在庫充足（補充不要）

💡 予測の根拠:
  - 明日は金曜日（通常+15%増）
  - 天気: 晴れ（通常比）
  - 近隣イベント: なし
```

---

#### 2.2 異常検知AI

```python
# 売上異常の自動検知

from sklearn.ensemble import IsolationForest

# 異常検知モデル
detector = IsolationForest(contamination=0.05)
detector.fit(normal_sales_data)

# リアルタイム監視
if detector.predict([current_sales]) == -1:
    alert = generate_anomaly_alert(current_sales)
    send_notification(alert)
```

**アラート例**:
```
🚨 異常検知アラート

新宿店: 売上急減を検知

【検知内容】
  時刻: 2024/01/25 14:30
  現在売上: ¥8,500（14:30時点）
  通常範囲: ¥15,000 - ¥18,000
  乖離度: -43%（危険域）

【考えられる原因】
  1. 決済端末の不具合（可能性: 高）
  2. 在庫切れによる販売不可（可能性: 中）
  3. 近隣イベント等の影響（可能性: 低）

【推奨アクション】
  ✓ 店舗デバイス状態を確認
  ✓ 主要商品の在庫を確認
  ✓ 必要に応じて現地確認

📊 詳細データ: [ダッシュボード]
```

---

#### 2.3 アラート優先度AI判定

```java
@Service
public class AlertPriorityAIService {
    
    /**
     * LLMによるアラート優先度自動判定
     */
    public AlertPriority classifyPriority(Alert alert) {
        String prompt = String.format("""
            以下のアラートの優先度を判定してください。
            
            【アラート情報】
            - 種類: %s
            - 店舗: %s（売上規模: %s）
            - 商品: %s（販売数/日: %d個）
            - 在庫: %d個
            - 継続時間: %s
            
            【優先度基準】
            CRITICAL: 売上への重大影響、安全リスク
            HIGH: 即日対応必要
            MEDIUM: 2-3日以内に対応
            LOW: 監視継続
            
            優先度と理由を返してください。
            """,
            alert.getType(), alert.getStoreName(), alert.getStoreRevenue(),
            alert.getProductName(), alert.getAvgDailySales(),
            alert.getCurrentStock(), alert.getDuration()
        );
        
        ChatResponse response = chatClient.call(new Prompt(prompt));
        return parseAlertPriority(response);
    }
}
```

---

### 🛠️ 実装技術

#### 機械学習モデル
```python
# scikit-learn ベースの予測モデル

# 1. 需要予測
{
  "algorithm": "Random Forest / XGBoost",
  "features": ["曜日", "天候", "過去販売数", "イベント"],
  "training_data": "過去6ヶ月の販売実績",
  "update_frequency": "週次"
}

# 2. 異常検知
{
  "algorithm": "Isolation Forest / LSTM",
  "monitoring": "リアルタイム売上監視",
  "threshold": "統計的外れ値（±3σ）",
  "alert_trigger": "自動アラート生成"
}
```

---

## Phase 3: 高度なAI機能

### 3.1 画像認識（在庫確認）

**ユースケース**: スマホで棚を撮影 → AI が商品・在庫数を自動認識

```python
# OpenAI Vision API 使用例

from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "この棚の在庫状況を確認してください。商品名と個数を教えてください。"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": shelf_image_url
                    }
                }
            ]
        }
    ]
)

# AI応答例:
"""
棚の在庫状況:
- おにぎり（ツナマヨ）: 約12個
- おにぎり（鮭）: 約8個
- サンドイッチ: 約6個
- 空き棚: 2段（要補充）

注意: 左下の棚に賞味期限ラベルが見えます。確認推奨。
"""
```

---

### 3.2 自然言語でのデータ操作

**ユースケース**: 「先週の渋谷店の売上トップ10商品をグラフにして」

```typescript
// Text-to-SQL + Chart Generation

async function naturalLanguageQuery(question: string) {
  // 1. 自然言語 → SQLクエリ生成
  const sql = await generateSQL(question);
  
  // 2. クエリ実行
  const data = await executeQuery(sql);
  
  // 3. グラフ設定生成
  const chartConfig = await generateChartConfig(question, data);
  
  // 4. EChartsで可視化
  return { data, chartConfig };
}
```

---

## 技術スタック

### 推奨構成

```yaml
AI Framework:
  Backend: Spring AI (Java) or LangChain4j
  Python: LangChain + FastAPI（機械学習モデル用）

LLM Provider:
  Primary: OpenAI API
    - Chat: gpt-4o-mini ($0.15/1M tokens)
    - Embedding: text-embedding-3-small ($0.02/1M tokens)
  Alternative: Azure OpenAI（エンタープライズ向け）

Vector Database:
  Development: Chroma DB（軽量、Dockerで簡単起動）
  Production: Qdrant or Pinecone（スケーラビリティ）

Machine Learning:
  Framework: scikit-learn, XGBoost
  Deployment: FastAPI + Docker
  Monitoring: MLflow

Monitoring:
  LLM Observability: LangSmith or Helicone
  Cost Tracking: OpenAI Dashboard
  Performance: Prometheus + Grafana
```

---

## 実装工数見積もり

### Phase 1: RAG運用アシスタント

| タスク                | 工数    | 内容                          |
|----------------------|--------|------------------------------|
| 環境構築              | 1日    | Docker, Spring AI, OpenAI API |
| データ準備・Embedding | 2日    | Vector DB構築                 |
| Backend API実装       | 3日    | RAG機能、プロンプト最適化        |
| Frontend UI実装       | 2日    | Chat UI、Markdown表示          |
| テスト・調整          | 2日    | 精度向上、ユーザビリティ改善      |
| **合計**             | **10日** |                              |

### Phase 2: 在庫予測・異常検知

| タスク                | 工数    |
|----------------------|--------|
| データ分析・特徴量設計  | 3日    |
| MLモデル開発・学習     | 3日    |
| API統合              | 2日    |
| UI実装               | 2日    |
| **合計**             | **10日** |

### Phase 3: 画像認識

| タスク                | 工数    |
|----------------------|--------|
| Vision API統合       | 2日    |
| モバイル撮影UI        | 3日    |
| 精度検証             | 3日    |
| **合計**             | **8日** |

---

## デモ・アピールポイント

### 技術面談でのアピール内容

✅ **RAG実装経験**
  - Vector DBを使った意味検索
  - プロンプトエンジニアリング
  - LLM API統合（OpenAI / Azure）

✅ **実務的なAI活用**
  - 運用効率化の具体的ユースケース
  - コスト最適化（gpt-4o-mini使用）
  - 精度とレスポンス速度のバランス

✅ **フルスタック開発**
  - Backend: Spring Boot + Spring AI
  - Frontend: Vue3 + TypeScript
  - ML: Python + scikit-learn
  - Infra: Docker, Vector DB

✅ **プロダクト思考**
  - ユーザー体験重視のUI設計
  - 段階的な機能追加計画
  - ROI測定可能なKPI設定

---

## 次のステップ

### 1. 最小実装（1週間）
- [ ] RAG環境構築
- [ ] 簡単な質問応答（3-5パターン）
- [ ] デモ動画撮影

### 2. 機能拡張（2週間）
- [ ] アラート自動サマリー
- [ ] データ分析アシスタント
- [ ] 需要予測プロトタイプ

### 3. 本番準備（1週間）
- [ ] セキュリティ対策
- [ ] ログ・監査
- [ ] ドキュメント整備

---

## 参考リソース

### 公式ドキュメント
- [Spring AI Documentation](https://docs.spring.io/spring-ai/reference/)
- [OpenAI API Reference](https://platform.openai.com/docs/)
- [LangChain Documentation](https://python.langchain.com/)
- [Chroma DB Guide](https://docs.trychroma.com/)

### サンプルコード
- [Spring AI Samples](https://github.com/spring-projects/spring-ai)
- [RAG Tutorial](https://github.com/openai/openai-cookbook)

---

**作成日**: 2026年1月25日  
**バージョン**: 1.0  
**想定読者**: 開発者、技術面接官、プロダクトオーナー

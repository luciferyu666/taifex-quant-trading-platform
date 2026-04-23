# 台指期企業級 Web 自動量化交易平台：技術規範說明書

## 1. 平台願景與核心設計理念 (Platform Vision & Design Philosophy)

### 戰略背景引言

在量化交易的演進過程中，從單機腳本（MVP）轉向雲端原生（Cloud-Native）平台，是從「策略驗證」跨越至「商業營運」的關鍵轉型。單機環境無法承擔高並發行情下的網路延遲、系統單點故障以及數據孤島風險。本平台旨在建立一個具備極致穩定性與可擴展性的企業級基礎設施，確保在極端市場波動下，交易系統仍能維持高可用性、數據一致性與嚴謹的合規風控，支撐多策略、多帳戶的規模化營運。

### 核心設計原則分析

- **訊號與執行完全解耦 (Signal-Execution Decoupling)：** 核心架構堅持「策略僅產生訊號，不參與執行」。策略層輸出標準化訊號（Signal），執行層（Execution Layer）負責保證金檢核、合約拆分與委託生命週期管理。此舉能有效降低營運風險，支撐橫向擴展至多券商並行下單。
- **數據治理與環境一致性：** 透過統一的資料管理管線，確保回測環境與實盤環境使用完全一致的資料標準，消除因資料偏差（Data Bias）導致的策略績效落差。
- **強制性環境隔離 (Environment Gating)：** 定義明確的策略生命週期：Research -> Backtest -> Paper -> **Shadow Trading** -> Live。其中 Shadow Trading 為強制性階段，在真實行情下運行邏輯但不下單，作為進入實盤前的最終驗證。

### 技術目標清單

- **高可用性部署：** 基於 Kubernetes 的多可用區（Multi-AZ）容錯架構。
- **分層儲存效能：** 毫秒級時序資料檢索與高倍率數據壓縮。
- **毫秒級風險阻斷：** Risk Engine 具備獨立預檢權限，在訊號送達 OMS 前完成硬性攔截。

--------------------------------------------------------------------------------

## 2. 雲原生架構與微服務編排 (Cloud-Native & Microservices)

### 架構層次分析

為兼顧管理靈活性與交易執行的高效能，本平台採用 **控制平面 (Control Plane)** 與 **交易/資料平面 (Trading/Data Plane)** 分離架構。

- **控制平面：** 處理策略配置、報表分析與權限管理。
- **交易/資料平面：** 處理即時行情（Tick-by-tick）、風控計算與下單執行。

### Kubernetes 部署實作規範

- **容器化隔離策略：** 利用 K8s Namespace 實施環境隔離。每個策略執行器（Strategy Runner）封裝於獨立 Pod，並配置 CPU 與 Memory 的資源限制（Resource Quotas），防止單一策略邏輯異常導致全系統崩潰。
- **智慧型橫向擴展 (HPA) 最佳化：** 傳統 CPU/Memory 指標無法反映交易負載。本平台實施 **自定義指標驅動的 HPA**，監控 **Kafka 消費延遲 (Consumer Lag)**。當行情數據積壓超過閾值時，自動擴展行情分發 Pod，確保開盤尖峰時刻的資料新鮮度。

### 微服務職責矩陣

| 服務名稱 | 核心職責 | 通訊機制 |
| --- | --- | --- |
| **Identity Service** | MFA 驗證、RBAC 權限管理、ASVS 安全合規 | gRPC / REST |
| **Market Data Service** | Tick 接入、K 線聚合與即時廣播 | Event Stream (Kafka) |
| **Session Engine** | 交易日曆管理、日/夜盤切換、T+1 日期對齊 | gRPC / Redis |
| **OMS** | 訂單生命週期、**冪等性檢查 (Idempotency)** | gRPC / NATS |
| **Risk Engine** | Pre-trade 攔截、全域部位限制、Kill Switch | gRPC (Low Latency) |

--------------------------------------------------------------------------------

## 3. 資料湖分層儲存架構 (Data Lakehouse Strategy)

### 數據治理分析

單一資料庫無法兼顧即時交易的強一致性與海量歷史資料的分析。本平台透過分層儲存（Tiered Storage）確保歷史回測與即時監控的效率平衡。

### 三層儲存技術選型

1. **TimescaleDB (Silver Layer)：** 儲存清洗後的 Tick 與分鐘 K 線。利用 **連續聚合 (Continuous Aggregates)** 技術，在背景預先計算各時框指標，大幅降低即時 Dashboard 的查詢負載。
2. **ClickHouse (Gold Layer)：** 作為 OLAP 核心，負責大規模回測績效分析與因子運算。利用其欄式儲存優勢，處理數十億級數據的聚合查詢可達毫秒級響應。
3. **PostgreSQL (Operational Layer)：** 負責非時序性業務數據，如使用者權限、訂單終態紀錄。

### 換月與連續月資料邏輯

針對台指期換月問題，Session Engine 會自動產生 `Rollover Events`。

```sql
-- 換月事件規則表
CREATE TABLE rollover_events (
    id UUID PRIMARY KEY,
    commodity_code VARCHAR(10), -- TX, MTX, TMF
    old_contract VARCHAR(10),   -- 舊合約 (如 202404)
    new_contract VARCHAR(10),   -- 新合約 (如 202405)
    roll_timestamp TIMESTAMPTZ, -- 換月時間點
    price_gap NUMERIC,          -- 價差調整值 (Back-adjusted)
    version_id VARCHAR(50)      -- 資料版本控制
);
```

--------------------------------------------------------------------------------

## 4. 交易執行核心與大小微台調度 (Trading Execution & Allocation)

### 執行邏輯與 Session 管理

台指期具備特殊的交易時間：日盤 (08:45-13:45) 與夜盤 (15:00-05:00)。**Session Engine** 負責處理 T+1 日期對齊，確保夜盤交易正確歸屬於次一交易日，並處理換月當日日盤結算後的合約自動切換。

### 大小微台 (TX/MTX/TMF) 智慧調度演算法

- **曝險正規化：** 基於 1 TX = 4 MTX = 20 TMF 比例。
- **殘差曝險處理 (Residual Exposure)：** 當策略請求非整數曝險時（如 0.28 TX），調度引擎採用 **「保守型向下取整」** 邏輯。
    - 計算過程：0.28 \text{ TX} = 1 \text{ MTX} + 0.6 \text{ MTX} = 1 \text{ MTX} + 3 \text{ TMF} \dots
    - 最終執行：1 口 MTX + 1 口 TMF（總計 0.3 TX）或依安全係數自動調整，嚴禁無授權之超額曝險。

### Broker Gateway 抽象層

將券商 SDK（如 Shioaji）封裝於標準化介面（Abstract Base Class）。

- **建築師警示：** 鑑於 Shioaji 等部分 SDK 仍處於 **early-release alpha** 階段，Gateway 層必須實施 **斷路器 (Circuit Breaker)** 與 **超時降級** 機制，防止 SDK 內部不穩定導致執行緒阻塞。

--------------------------------------------------------------------------------

## 5. 企業級風險控管與 OMS 系統 (Enterprise Risk & OMS)

### 風險防護分析

**Risk Engine** 是系統的「最後一道防線」。它具備獨立於 OMS 的執行權限，若偵測到異常（如重複下單或資金不足），可在指令送達券商前直接攔截並關閉策略。

### 三層風控體系定義

1. **Pre-trade (事前)：** 執行 **冪等性鍵 (Idempotency Key)** 校驗、價格帶檢查、單筆口數限制與可用保證金即時核扣。
2. **In-trade (事中)：** 即時監控行情新鮮度（Stale Quote Check，若行情延遲 > 2s 則阻斷下單）、API 心跳狀態。
3. **Post-trade (事後)：** 盤後自動對帳（Reconciliation），比對平台內部持倉與券商端真實部位。

### OMS 狀態機管理

定義嚴格的訂單生命週期，包含部分成交與失效處理：

```
[Pending] -> [Risk Approved] -> [Sent to Broker]
               |                  |
               |       [Partially Filled] <--> [Partial Cancel]
               |                  |
 [Rejected] <--+-------- [Filled] / [Canceled] / [Expired]
```

*註：所有委託必須帶入 Unique Idempotency Key，防止因網路重傳導致重複下單。*

--------------------------------------------------------------------------------

## 6. 資安防護、權限治理與合規 (Security & Compliance)

### 安全技術架構

- **憑證金庫 (Secrets Management)：** 整合 **HashiCorp Vault**。券商 API Key 與私鑰嚴禁寫入環境變數或設定檔，僅在運行時通過存取權杖動態提取。
- **身份與權限：** 實施 MFA 與 RBAC。根據職責定義「策略研究員（唯讀）」、「交易員（啟停權）」、「風控長（Kill Switch 權）」。

### 不可篡改稽核紀錄 (Audit Log)

| 操作類別 | 紀錄項目 | 稽核意義 |
| --- | --- | --- |
| **策略調整** | 參數修改、邏輯更新版本 | 追蹤損益偏差之源頭 |
| **風控干預** | Kill Switch 觸發、手動平倉 | 法律合規與責任判定基準 |
| **金鑰操作** | 憑證更新、Vault 存取紀錄 | 防範內部操作不當 |

--------------------------------------------------------------------------------

## 7. 可觀測性、營運監控與災難復原 (Observability & Ops)

### 三位一體監控實作

- **Metrics (Prometheus/Grafana)：** 監控關鍵 KPI（API 延遲 P99、委託拒絕率、Kafka Lag）。
- **Logs (Loki)：** 結構化交易日誌，完整紀錄「訊號 -> 風控 -> 委託 -> 成交」的序列號追蹤。
- **Traces (OpenTelemetry)：** 跨微服務追蹤，用於除錯交易異常中的毫秒級延遲點。

### 災難復原 (DR) 演練手冊

- [ ]  **券商斷線：** Gateway 自動切換至備援 API 線路。
- [ ]  **資料庫故障：** 啟動備援資料庫，並重播當日 Kafka 事件流以重建即時部位。
- [ ]  **策略 Pod 重啟：** 容器啟動後立即向 OMS 同步當前「未平倉部位」與「委託中訂單」，防止冷啟動導致的重複開倉。

### 結語

本規範書將原有的 MVP 量化構想，重塑為具備**高強度風控、雲端彈性與數據治理能力**的企業級交易平台。透過訊號解耦與嚴格的狀態機管理，確保平台能在台指期高波動的環境下，達成長期且穩定的資產增長價值。
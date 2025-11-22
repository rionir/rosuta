# 勤怠・シフト管理 SaaS — MVP 進捗管理（層別ラベル付き）

**目的:** Cursor エージェントが「バックエンド / API / UI」ごとにタスクを取得して効率的に実装できるようにする。

---

## 1. タスク一覧（層別ラベル付き）

| タスクID | カテゴリ | タスク内容 | 層 | 対象テーブル / モデル | 優先度 | 状態 | 備考 |
|----------|---------|-----------|----|---------------------|--------|------|------|
| T001 | 認証 | Supabase 認証連携 | backend | users | 高 | [ ] | UUID を primary key として使用 |
| T002 | ユーザー管理 | ユーザー追加・編集・削除 | backend | company_users | 高 | [ ] | 企業ごとの役割管理（admin/staff） |
| T003 | 店舗所属管理 | スタッフの店舗所属管理 | backend | user_stores | 高 | [ ] | 複数店舗対応、所属有効フラグ管理 |
| T004 | 企業管理 | 企業情報管理 | backend | companies | 高 | [ ] | Stripe 顧客ID、プラン、ステータス管理 |
| T005 | 店舗管理 | 店舗情報管理 | backend | company_stores | 高 | [ ] | 店舗名・住所、複数店舗対応 |
| T006 | 店舗設定 | 打刻承認設定管理 | backend | store_settings | 中 | [ ] | approval_required フラグ管理 |
| T007 | シフト管理 | シフト作成・編集・削除 | backend | shifts | 高 | [ ] | 出勤/退勤予定、複数店舗対応 |
| T008 | 休憩管理 | 休憩作成・編集・削除 | backend | shift_breaks | 高 | [ ] | 1シフトに複数休憩対応 |
| T009 | シフトコピー | 日/週/月コピー機能 | backend | shift_copies | 中 | [ ] | 上書き/スキップ管理 |
| T010 | 打刻管理 | 出勤・退勤・休憩打刻 | backend | clock_records | 高 | [ ] | 打刻種類、選択時刻、実際時刻、方法、店舗情報 |
| T010a | 打刻画面 | 打刻画面作成（UI） | UI | clock_records | 高 | [ ] | 出勤／退勤／休憩開始／休憩終了ボタン、時刻選択モーダル、店舗選択対応 |
| T011 | 承認機能 | 打刻承認管理 | backend / api | clock_records / store_settings | 中 | [ ] | pending / approved / rejected 状態管理 |
| T012 | 打刻編集 | 打刻編集機能（承認制適用） | backend / api | clock_records | 中 | [ ] | 管理者が承認制の場合のみ反映 |
| T013 | カレンダー表示 | スタッフ向けカレンダー | UI / api | shifts / clock_records | 高 | [ ] | 自分のシフト・過去打刻履歴表示、日ごと色分け、複数店舗切替 |
| T014 | カレンダー表示 | 管理者向けカレンダー | UI / api | shifts / clock_records | 高 | [ ] | 店舗全体・個人別勤務状況、日/週/月表示、未打刻者リスト |
| T015 | 勤務実績集計 | 日別・週別・月別勤務時間表示 | UI / api | shifts / clock_records | 中 | [ ] | 予定時間との比較、店舗別集計 |
| T016 | 課金管理 | Stripe サブスク情報管理 | backend / api | subscriptions | 中 | [ ] | current_period_start/end, status, subscription_id |
| T017 | テスト | 単体テスト実装 | backend / api / UI | すべて | 高 | [ ] | CRUD・打刻・承認・カレンダー表示 |
| T018 | テスト | 結合テスト実装 | backend / api / UI | すべて | 高 | [ ] | MVPとして必要な機能の全体確認 |

---

## 2. 作業の進め方（Cursor向け）

1. **backend タスク**（T001〜T010, T011, T012, T016）を実装  
2. **api タスク**（T011, T012, T013〜T016）でフロントとの通信設計・エンドポイント実装  
3. **UI タスク**（T010a, T013, T014, T015）で画面設計・表示ロジック実装  
4. **テスト**（T017, T018）で単体・結合テストを実施  

> 💡 層ごとにラベルがあるので、Cursor は優先順や担当範囲を明確にしてタスクを pull 可能

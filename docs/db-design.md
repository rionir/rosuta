# 勤怠・シフト管理 SaaS — 統合DB設計（MVP / 複数企業対応・休憩複数対応）

## 1. users（Supabase認証ユーザー）

| カラム名    | 型        | 説明                         |
|------------|-----------|------------------------------|
| id         | uuid      | auth.users.id（主キー）       |
| last_name  | text      | 姓                           |
| first_name | text      | 名                           |
| created_at | timestamp | 作成日時                     |
| updated_at | timestamp | 更新日時                     |

> 役割は `company_users.role` で管理（staff/admin）

---

## 2. companies（企業・事業所）

| カラム名            | 型         | 説明                                         |
|--------------------|------------|----------------------------------------------|
| id                 | serial     | 主キー                                       |
| name               | text       | 企業名                                       |
| stripe_customer_id | text       | Stripe顧客ID                                |
| plan               | text       | 'free', 'pro', 'enterprise' など            |
| status             | text       | 'active', 'past_due', 'canceled' など       |
| created_at         | timestamp  | 作成日時                                     |
| updated_at         | timestamp  | 更新日時                                     |

---

## 3. company_users（企業ごとのユーザー所属）

| カラム名    | 型        | 説明                       |
|------------|-----------|----------------------------|
| id         | serial    | 主キー                     |
| company_id | int       | companies.id（FK）         |
| user_id    | uuid      | users.id（FK）             |
| is_admin   | boolean   | 管理者権限                 |
| is_active  | boolean   | 有効フラグ                 |
| created_at | timestamp | 作成日時                   |
| updated_at | timestamp | 更新日時                   |

---

## 4. company_stores（企業ごとの店舗）

| カラム名     | 型        | 説明                       |
|-------------|-----------|----------------------------|
| id          | serial    | 主キー                     |
| company_id  | int       | companies.id（FK）         |
| name        | text      | 店舗名                     |
| address     | text      | 店舗住所（任意）           |
| created_at  | timestamp | 作成日時                   |
| updated_at  | timestamp | 更新日時                   |

---

## 5. user_stores（スタッフの店舗所属）

| カラム名    | 型        | 説明                       |
|------------|-----------|----------------------------|
| id         | serial    | 主キー                     |
| user_id    | uuid      | users.id（FK）             |
| store_id   | int       | company_stores.id（FK）    |
| is_active  | boolean   | 所属有効フラグ             |
| created_at | timestamp | 作成日時                   |
| updated_at | timestamp | 更新日時                   |

---

## 6. shifts（シフト予定）

| カラム名         | 型                        | 説明                                         |
|-----------------|---------------------------|----------------------------------------------|
| id              | serial                    | 主キー                                       |
| user_id         | uuid                      | users.id（FK）                               |
| store_id        | int                       | company_stores.id（FK）                      |
| scheduled_start | timestamp with time zone | 出勤予定時刻（JSTタイムゾーン対応、日付・時刻を含む）|
| scheduled_end   | timestamp with time zone  | 退勤予定時刻（JSTタイムゾーン対応、夜勤対応、日付・時刻を含む）|
| created_by      | uuid                      | 登録者ID（管理者）                           |
| created_at      | timestamp                 | 作成日時                                     |
| updated_at      | timestamp                 | 更新日時                                     |

> **注意**: `date`カラムは削除され、`scheduled_start`と`scheduled_end`に日付・時刻の両方が含まれます。夜勤対応のため、`scheduled_end`が翌日になる場合があります。

---

## 7. shift_breaks（休憩予定・複数対応）

| カラム名         | 型                        | 説明                                         |
|-----------------|---------------------------|----------------------------------------------|
| id              | serial                    | 主キー                                       |
| shift_id        | int                       | shifts.id（FK）                              |
| break_start     | timestamp with time zone  | 休憩開始予定（JSTタイムゾーン対応）          |
| break_end       | timestamp with time zone  | 休憩終了予定（JSTタイムゾーン対応）          |
| created_at      | timestamp                 | 作成日時                                     |
| updated_at      | timestamp                 | 更新日時                                     |

---

## 8. clock_records（打刻履歴）

| カラム名           | 型         | 説明                                             |
|-------------------|------------|--------------------------------------------------|
| id                | serial     | 主キー                                           |
| user_id           | uuid       | users.id（FK）                                   |
| store_id          | int        | company_stores.id（FK）                          |
| shift_id          | int        | shifts.id（FK, 任意）                            |
| break_id          | int        | shift_breaks.id（FK, 任意）                      |
| type              | text       | 'clock_in', 'clock_out', 'break_start', 'break_end' |
| selected_time     | timestamp  | 選択した時刻                                     |
| actual_time       | timestamp  | 実際にボタンを押した時刻                         |
| method            | text       | 'scheduled' / 'current' / 'manual'             |
| status            | text       | 'pending', 'approved', 'rejected'               |
| created_by        | uuid       | 作成者ID                                        |
| approved_by       | uuid       | 承認者ID                                        |
| created_at        | timestamp  | 作成日時                                        |
| updated_at        | timestamp  | 更新日時                                        |

---

## 9. store_settings（店舗ごとの設定）

| カラム名          | 型        | 説明                                         |
|------------------|-----------|----------------------------------------------|
| id               | serial    | 主キー                                        |
| store_id         | int       | company_stores.id（FK）                       |
| approval_required | boolean  | 打刻承認が必要か                               |
| created_at       | timestamp | 作成日時                                     |
| updated_at       | timestamp | 更新日時                                     |

---

## 10. shift_copies（シフトコピー履歴 / 操作記録）

| カラム名          | 型        | 説明                                         |
|------------------|-----------|----------------------------------------------|
| id               | serial    | 主キー                                        |
| user_id          | uuid      | 操作した管理者                               |
| source_date      | date      | コピー元日付                                 |
| target_date      | date      | コピー先日付                                 |
| overwrite        | boolean   | 既存シフト上書きフラグ                        |
| created_at       | timestamp | 作成日時                                     |

---

## 11. subscriptions（Stripe課金情報）

| カラム名                 | 型         | 説明                                         |
|-------------------------|------------|----------------------------------------------|
| id                      | serial     | 主キー                                       |
| company_id              | int        | companies.id（FK）                            |
| stripe_subscription_id  | text       | StripeのサブスクID                            |
| status                  | text       | 'active', 'past_due', 'canceled' など        |
| current_period_start    | timestamp  | 現在期間開始                                 |
| current_period_end      | timestamp  | 現在期間終了                                 |
| created_at              | timestamp  | 作成日時                                     |
| updated_at              | timestamp  | 更新日時                                     |

---

## 💡 ポイントまとめ

1. **企業単位で管理**
   - `companies` に Stripe 顧客IDとプラン管理
   - `company_users` でユーザー役割管理（admin/staff）
   - 店舗・シフト・打刻は企業内に紐付け
2. **複数店舗対応**
   - `user_stores` でスタッフの店舗所属管理
   - `shifts`・`clock_records` は必ず `store_id` 紐付け
3. **休憩複数対応**
   - `shift_breaks` で1シフトに複数休憩管理可能
   - 打刻は `clock_records.break_id` に紐付け
4. **承認制**
   - `store_settings.approval_required` で店舗ごとに設定
   - `clock_records.status` で承認状態管理
5. **シフトコピー**
   - `shift_copies` に操作記録（上書き or スキップ）
6. **MVP対応**
   - カレンダー表示・勤務状況確認・打刻・承認・複数店舗・企業管理
   - Stripe課金情報管理
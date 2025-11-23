# データベースクエリ分析レポート

## 管理カレンダーページ (/admin/calendar) のクエリ分析

### 現在のクエリ回数

#### Server Component (app/admin/calendar/page.tsx)
1. `getCurrentUser()` - 2クエリ
   - `auth.getUser()` - 認証情報取得
   - `users`テーブルからSELECT - プロフィール情報取得
2. `isUserAdmin()` - 1クエリ
   - `company_users`テーブルからSELECT
3. `getUserStores()` - 1クエリ
   - `user_stores`テーブルからSELECT
4. `getStoreUsers()` - 1クエリ
   - `user_stores`テーブルからJOIN `users`テーブル

**Server Component合計: 5クエリ**

#### Client Component (AdminCalendarComponent)
5. `getAdminCalendarData()` - 2クエリ
   - `getStoreShifts()` - `shifts`テーブルからSELECT（`select('*')`）
   - `getStoreClockRecords()` - `clock_records`テーブルからJOIN `users`テーブル
6. `getUnclockedUsers()` - 2クエリ（日付選択時）
   - `shifts`テーブルからJOIN `users`テーブル
   - `clock_records`テーブルからSELECT

**Client Component合計: 4クエリ（初回ロード時）**

**総合計: 約9クエリ/ページロード**

## 問題点

### 1. 不要なカラムの取得
- `getStoreShifts()`で`select('*')`を使用
- 必要なカラムのみを選択すべき

### 2. 重複するクエリ
- `getUnclockedUsers()`で`shifts`テーブルを再度取得
- 既に`getAdminCalendarData()`で取得済みのデータを活用できる

### 3. JOINの一貫性
- `getStoreClockRecords()`ではJOINしているが、`getStoreShifts()`ではJOINしていない
- ユーザー情報の取得方法が統一されていない

### 4. キャッシュの未設定
- すべてのクエリがキャッシュなしで実行されている
- 同じデータを繰り返し取得している可能性

### 5. N+1問題の可能性
- 日付ごとに`getUnclockedUsers()`を呼び出す場合、N回のクエリが発生する可能性

## 改善提案

### 1. 必要なカラムのみを選択
```typescript
// 改善前
.select('*')

// 改善後
.select('id, user_id, store_id, scheduled_start, scheduled_end, created_by')
```

### 2. データの再利用
- `getUnclockedUsers()`で既に取得した`shifts`データを活用
- クライアント側で計算処理を行う

### 3. JOINの統一
- `getStoreShifts()`でもJOINを使用してユーザー情報を取得
- または、`getStoreUsers()`で取得したデータをマージ

### 4. キャッシュの設定
```typescript
// Next.js 16のキャッシュ設定
export const revalidate = 60 // 60秒間キャッシュ

// またはServer Actionで
const { data } = await supabase
  .from('shifts')
  .select('*')
  .cache('public', { maxAge: 300 }) // 5分間キャッシュ
```

### 5. クエリの統合
- 複数のクエリを1つのクエリに統合できる場合は統合
- 例: `getStoreShifts()`と`getStoreClockRecords()`を1つのクエリに統合（可能な場合）

## 推奨される改善順序

1. **即座に実施**: 必要なカラムのみを選択（`select('*')`の削減）
2. **短期**: キャッシュの設定、データの再利用
3. **中期**: JOINの統一、クエリの統合
4. **長期**: N+1問題の解決、クエリの最適化

## 目標

- **クエリ回数**: 9回 → 5-6回に削減
- **クエリ実行時間**: 各クエリ < 100ms
- **総クエリ時間**: < 500ms


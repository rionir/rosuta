# ロスタ (rosuta.com)

勤怠・シフト管理 SaaS

## 技術スタック

- **フロントエンド**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **バックエンド**: Supabase (PostgreSQL + Auth)
- **課金**: Stripe
- **ホスティング**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Google Analytics (GA4)
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_measurement_id
```

> ⚠️ **重要**: `SUPABASE_SERVICE_ROLE_KEY`はサーバーサイドでのみ使用します。絶対にクライアントに露出しないでください。

### 3. Supabaseデータベースのセットアップ

1. Supabaseプロジェクトを作成
2. `supabase/migrations/`配下のマイグレーションファイルを順番に実行
3. Row Level Security (RLS) ポリシーが設定済み

> 💡 **注意**: マイグレーションファイルは時系列順に実行してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## プロジェクト構造

```
app/
├── layout.tsx              # ルートレイアウト（<html>, <body>, フォント, ThemeProvider）
├── page.tsx                # ランディングページ（/）
├── not-found.tsx           # カスタム404ページ
└── app/                    # サービスページ（/app/*）
    ├── layout.tsx          # アプリレイアウト（NavigationWrapper）
    ├── dashboard/          # ダッシュボード（/app/dashboard）
    ├── login/              # ログインページ（/app/login）
    ├── clock/              # 打刻画面（/app/clock）
    ├── shifts/             # シフトカレンダー（/app/shifts）
    ├── summary/            # 勤務実績集計（/app/summary）
    └── admin/              # 管理画面（/app/admin/*）
        ├── calendar/       # 管理者カレンダー
        ├── shifts/         # シフト管理
        ├── users/          # スタッフ管理
        ├── stores/         # 店舗管理
        ├── clock-records/  # 打刻承認
        └── settings/       # 設定
```

## 主な機能

- ✅ **打刻管理**: 出勤・退勤・休憩の打刻を簡単に記録
- ✅ **シフト管理**: シフトの作成・編集・削除、日/週/月単位でのコピー機能
- ✅ **カレンダー表示**: スタッフや管理者がシフトと打刻記録を一目で確認
- ✅ **打刻承認**: 打刻の修正や手動打刻を承認フローで管理
- ✅ **勤務実績集計**: 日別・週別・月別で勤務時間を集計
- ✅ **複数店舗対応**: 1店舗から複数店舗まで対応。店舗ごとの設定やスタッフの所属管理が可能

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

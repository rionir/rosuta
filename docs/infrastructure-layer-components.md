# Infrastructure層に含まれる可能性のあるコンポーネント

## 現在の構造

```
infrastructure/
└── repositories/
    ├── user/
    ├── company/
    ├── store/
    ├── shift/
    ├── clock-record/
    └── store-settings/
```

現在は**リポジトリのみ**が含まれています。

## Infrastructure層に含まれる可能性のあるコンポーネント

### 1. リポジトリ実装（現在実装済み）
- **データベースアクセス**: Supabase、PostgreSQL、MySQLなど
- **例**: `SupabaseUserRepository`, `SupabaseStoreRepository`

### 2. 外部サービス連携（将来実装の可能性）

#### 2.1 決済サービス
- **Stripe連携**: サブスクリプション管理、決済処理
- **構造例**:
  ```
  infrastructure/
  └── payment/
      └── stripe-payment-service.ts
  ```

#### 2.2 メール送信サービス
- **メール送信**: 通知、パスワードリセット、レポート送信
- **構造例**:
  ```
  infrastructure/
  └── email/
      └── supabase-email-service.ts
      └── sendgrid-email-service.ts
  ```

#### 2.3 ファイルストレージサービス
- **ファイルアップロード**: 画像、ドキュメント、エクスポートファイル
- **構造例**:
  ```
  infrastructure/
  └── storage/
      └── supabase-storage-service.ts
      └── s3-storage-service.ts
  ```

#### 2.4 通知サービス
- **プッシュ通知**: モバイルアプリ通知
- **構造例**:
  ```
  infrastructure/
  └── notification/
      └── firebase-notification-service.ts
  ```

### 3. キャッシュ実装（将来実装の可能性）
- **キャッシュ**: Redis、メモリキャッシュ
- **構造例**:
  ```
  infrastructure/
  └── cache/
      └── redis-cache-service.ts
  ```

### 4. ロギング実装（将来実装の可能性）
- **ログ管理**: ログの記録、集約
- **構造例**:
  ```
  infrastructure/
  └── logging/
      └── winston-logger.ts
      └── cloudwatch-logger.ts
  ```

### 5. 設定管理（将来実装の可能性）
- **設定**: 環境変数、設定ファイルの読み込み
- **構造例**:
  ```
  infrastructure/
  └── config/
      └── environment-config.ts
  ```

## 推奨される構造（将来を見据えた設計）

### オプション1: 機能ごとに整理（現在の構造を維持）

```
infrastructure/
├── repositories/
│   ├── user/
│   ├── company/
│   └── ...
├── services/          # 将来追加
│   ├── payment/
│   │   └── stripe-payment-service.ts
│   ├── email/
│   │   └── supabase-email-service.ts
│   └── storage/
│       └── supabase-storage-service.ts
└── cache/            # 将来追加
    └── redis-cache-service.ts
```

**メリット**:
- 機能ごとに明確に分離される
- 新しい機能を追加しやすい
- 現在の構造と一貫性がある

**デメリット**:
- ドメインごとの整理ではない

### オプション2: ドメインごとに整理（application/domainと統一）

```
infrastructure/
├── user/
│   ├── repositories/
│   │   └── supabase-user-repository.ts
│   └── services/     # 将来追加（ユーザー関連の外部サービス）
│       └── email-verification-service.ts
├── company/
│   ├── repositories/
│   │   └── supabase-company-repository.ts
│   └── services/     # 将来追加
│       └── stripe-customer-service.ts
└── payment/          # 新しいドメイン
    └── services/
        └── stripe-payment-service.ts
```

**メリット**:
- application/domain層と構造が統一される
- ドメインごとにすべての実装が揃う

**デメリット**:
- 複数ドメインにまたがるサービス（メール送信など）の配置が難しい

### オプション3: ハイブリッド（推奨）

```
infrastructure/
├── user/
│   └── repositories/
│       └── supabase-user-repository.ts
├── company/
│   └── repositories/
│       └── supabase-company-repository.ts
├── shared/           # 複数ドメインで共有されるサービス
│   ├── services/
│   │   ├── email/
│   │   │   └── email-service.ts
│   │   ├── storage/
│   │   │   └── storage-service.ts
│   │   └── payment/
│   │       └── stripe-payment-service.ts
│   └── cache/
│       └── cache-service.ts
```

**メリット**:
- ドメイン固有の実装はドメインごとに整理
- 共有サービスは`shared/`に配置
- 柔軟性が高い

## 現在のプロジェクトでの推奨

**現時点では、オプション1（機能ごとに整理）を維持することを推奨**します。

**理由**:
1. 現在はリポジトリのみで、構造がシンプル
2. 将来的に追加されるサービス（Stripe、メール送信など）は、ドメイン固有ではなく共有される可能性が高い
3. 変更コストが最小限

**ただし、将来的にドメイン固有の外部サービスが増える場合は、オプション3（ハイブリッド）への移行を検討**してください。


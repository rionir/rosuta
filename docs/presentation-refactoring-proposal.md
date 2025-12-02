# Presentation層のドメインごとの構成へのリファクタリング提案

## 現在の構造

```
presentation/
├── actions/
│   ├── admin-calendar.ts          # ドメイン未分類
│   ├── calendar.ts                # ドメイン未分類
│   ├── work-summary.ts            # ドメイン未分類
│   ├── auth/                      # ✅ ドメインごと
│   ├── clock-record/              # ✅ ドメインごと
│   ├── company/                   # ✅ ドメインごと
│   ├── shift/                     # ✅ ドメインごと
│   ├── store/                     # ✅ ドメインごと
│   ├── store-settings/            # ✅ ドメインごと
│   └── user/                      # ✅ ドメインごと
├── dto/
│   ├── clock-record-dto.ts        # フラット構造
│   ├── company-dto.ts
│   ├── company-user-dto.ts
│   ├── shift-dto.ts
│   ├── store-dto.ts
│   ├── store-settings-dto.ts
│   └── user-dto.ts
└── common/
    └── error-handler.ts
```

## 提案する新しい構造

```
presentation/
├── actions/
│   ├── auth/
│   │   └── auth.ts
│   ├── calendar/
│   │   └── calendar.ts            # calendar.ts を移動
│   ├── admin-calendar/
│   │   └── admin-calendar.ts      # admin-calendar.ts を移動
│   ├── work-summary/
│   │   └── work-summary.ts        # work-summary.ts を移動
│   ├── clock-record/
│   │   └── clock-records.ts
│   ├── company/
│   │   └── companies.ts
│   ├── shift/
│   │   ├── shifts.ts
│   │   └── shift-breaks.ts
│   ├── store/
│   │   ├── stores.ts
│   │   └── user-stores.ts
│   ├── store-settings/
│   │   └── store-settings.ts
│   └── user/
│       └── users.ts
├── dto/
│   ├── auth/
│   │   └── (必要に応じて)
│   ├── calendar/
│   │   └── (必要に応じて)
│   ├── admin-calendar/
│   │   └── (必要に応じて)
│   ├── work-summary/
│   │   └── (必要に応じて)
│   ├── clock-record/
│   │   └── clock-record-dto.ts
│   ├── company/
│   │   ├── company-dto.ts
│   │   └── company-user-dto.ts
│   ├── shift/
│   │   └── shift-dto.ts
│   ├── store/
│   │   └── store-dto.ts
│   ├── store-settings/
│   │   └── store-settings-dto.ts
│   └── user/
│       └── user-dto.ts
└── common/
    └── error-handler.ts
```

## メリット

1. **一貫性**: すべてのドメインが同じ構造で整理される
2. **可読性**: ドメインごとにファイルがグループ化され、見つけやすい
3. **保守性**: ドメインごとの変更が局所化される
4. **スケーラビリティ**: 新しいドメインを追加しやすい
5. **ドメイン駆動設計との整合性**: domain, application, infrastructure と同じ構造

## 移行手順

1. 新しいディレクトリ構造を作成
2. ファイルを移動
3. import文を更新
4. 動作確認
5. 古いファイルを削除

## 注意点

- `admin-calendar`, `calendar`, `work-summary` は複数ドメインにまたがる可能性がある
  - これらは「アプリケーション機能」として扱うか、主要ドメインに分類する
  - 例: `calendar` → `shift/calendar.ts` または `calendar/` として独立


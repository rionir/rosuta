# レイヤー間の構造統一提案

## 現在の構造の違い

### application層
```
application/
└── user/
    ├── dto/
    └── use-cases/
```
✅ **ドメインごとに整理**（推奨パターン）

### domain層
```
domain/
└── user/
    ├── entities/
    ├── repositories/
    └── value-objects/
```
✅ **ドメインごとに整理**（推奨パターン）

### infrastructure層
```
infrastructure/
└── repositories/
    └── user/
        └── supabase-user-repository.ts
```
⚠️ **機能（repositories）ごとに整理、その下にドメイン**

### presentation層
```
presentation/
├── actions/
│   └── user/
│       └── users.ts
└── dto/
    └── user-dto.ts  (フラット)
```
⚠️ **機能（actions/dto）ごとに整理、actionsのみドメインごと**

## 問題点

1. **一貫性の欠如**: レイヤーごとに構造が異なる
2. **可読性の低下**: どこに何があるか予測しにくい
3. **保守性の低下**: ドメインごとの変更が散在する

## 提案: ドメインごとに統一（オプション1 - 推奨）

すべてのレイヤーを**ドメインごとに整理**する。

### 新しい構造

```
application/
└── user/
    ├── dto/
    └── use-cases/
    ✅ 変更なし

domain/
└── user/
    ├── entities/
    ├── repositories/
    └── value-objects/
    ✅ 変更なし

infrastructure/
└── user/  ← 変更
    └── repositories/
        └── supabase-user-repository.ts

presentation/
└── user/  ← 変更
    ├── actions/
    │   └── users.ts
    └── dto/
        ├── user-dto.ts
        └── company-user-dto.ts
```

### メリット

1. **一貫性**: すべてのレイヤーが同じ構造
2. **可読性**: ドメインごとにすべてのレイヤーが揃う
3. **保守性**: ドメインごとの変更が局所化される
4. **スケーラビリティ**: 新しいドメインを追加しやすい

### デメリット

1. **移行コスト**: ファイル移動とimport文の更新が必要
2. **infrastructure層の変更**: `repositories/` の下からドメインの下に移動

## 代替案: 機能ごとに統一（オプション2）

すべてのレイヤーを**機能ごとに整理**する。

### 構造

```
application/
└── use-cases/  ← 変更
    └── user/
        └── create-user-use-case.ts
└── dto/  ← 変更
    └── user/
        └── create-user-dto.ts

domain/
└── entities/  ← 変更
    └── user/
        └── user.ts
└── repositories/  ← 変更
    └── user/
        └── user-repository.ts

infrastructure/
└── repositories/  ← 変更なし
    └── user/
        └── supabase-user-repository.ts

presentation/
└── actions/  ← 変更なし
    └── user/
        └── users.ts
└── dto/  ← 変更
    └── user/
        └── user-dto.ts
```

### デメリット

1. **application/domain層の大幅な変更**: 既存の構造を大きく変更する必要がある
2. **ドメイン駆動設計との不一致**: DDDではドメインごとに整理するのが一般的

## 推奨: オプション1（ドメインごとに統一）

**理由**:
- application/domain層は既にドメインごとに整理されている
- ドメイン駆動設計のベストプラクティスに合致
- 変更範囲が限定的（infrastructure/presentation層のみ）

## 移行手順

### Phase 1: infrastructure層の変更
```
infrastructure/repositories/user/ 
→ infrastructure/user/repositories/
```

### Phase 2: presentation層の変更
```
presentation/actions/user/
→ presentation/user/actions/

presentation/dto/user-dto.ts
→ presentation/user/dto/user-dto.ts
```

### Phase 3: import文の更新
- すべてのimport文を新しいパスに更新
- ビルドエラーを修正

### Phase 4: 動作確認
- すべての機能が正常に動作することを確認


# Presentation層の構造推奨案

## 前提条件

- **application層**: ドメインごとに整理（`application/user/use-cases/`）
- **domain層**: ドメインごとに整理（`domain/user/entities/`）
- **infrastructure層**: 機能ごとに整理を維持（`infrastructure/repositories/user/`）

## 現在の構造

```
presentation/
├── actions/
│   ├── user/              ✅ ドメインごと
│   ├── company/           ✅ ドメインごと
│   ├── store/             ✅ ドメインごと
│   ├── shift/             ✅ ドメインごと
│   ├── clock-record/      ✅ ドメインごと
│   ├── store-settings/    ✅ ドメインごと
│   ├── auth/              ✅ ドメインごと
│   ├── calendar.ts        ⚠️ フラット
│   ├── admin-calendar.ts  ⚠️ フラット
│   └── work-summary.ts    ⚠️ フラット
└── dto/
    ├── user-dto.ts        ⚠️ フラット
    ├── company-dto.ts
    ├── shift-dto.ts
    └── ...
```

## 選択肢

### オプション1: ドメインごとに統一（推奨）

```
presentation/
├── user/
│   ├── actions/
│   │   └── users.ts
│   └── dto/
│       ├── user-dto.ts
│       └── company-user-dto.ts
├── company/
│   ├── actions/
│   │   └── companies.ts
│   └── dto/
│       └── company-dto.ts
├── calendar/              # 複数ドメインにまたがる機能
│   ├── actions/
│   │   └── calendar.ts
│   └── dto/
│       └── (必要に応じて)
├── admin-calendar/        # 複数ドメインにまたがる機能
│   ├── actions/
│   │   └── admin-calendar.ts
│   └── dto/
│       └── (必要に応じて)
├── work-summary/          # 複数ドメインにまたがる機能
│   ├── actions/
│   │   └── work-summary.ts
│   └── dto/
│       └── (必要に応じて)
└── common/
    └── error-handler.ts
```

**メリット**:
1. ✅ **application層との一貫性**: `application/user/use-cases/` → `presentation/user/actions/`
2. ✅ **可読性**: ドメインごとにactionsとdtoが揃う
3. ✅ **保守性**: ドメインごとの変更が局所化される
4. ✅ **スケーラビリティ**: 新しいドメインを追加しやすい

**デメリット**:
1. ⚠️ **複数ドメインにまたがる機能**: `calendar`, `admin-calendar`, `work-summary`は独立したドメインとして扱う必要がある

### オプション2: 機能ごとに統一（infrastructureと統一）

```
presentation/
├── actions/
│   ├── user/
│   ├── company/
│   ├── calendar/
│   └── ...
└── dto/
    ├── user/
    │   ├── user-dto.ts
    │   └── company-user-dto.ts
    ├── company/
    │   └── company-dto.ts
    └── ...
```

**メリット**:
1. ✅ **infrastructure層との一貫性**: 機能ごとに整理
2. ✅ **変更コストが低い**: 現在の構造に近い

**デメリット**:
1. ❌ **application層との不一致**: `application/user/use-cases/` と `presentation/actions/user/` で構造が異なる
2. ❌ **可読性の低下**: ドメインごとの関連ファイルが散在する

## 推奨: オプション1（ドメインごとに統一）

### 理由

1. **application層との直接的な関係**
   - presentation層はapplication層のユースケースを直接使用する
   - `presentation/user/actions/users.ts` → `application/user/use-cases/create-user-use-case.ts`
   - 構造が一致している方が理解しやすい

2. **ドメイン駆動設計との整合性**
   - domain層、application層がドメインごとに整理されている
   - presentation層もドメインごとに整理することで、全体の一貫性が保たれる

3. **保守性の向上**
   - ドメインごとの変更（例: Userドメインの機能追加）が一箇所に集約される
   - actionsとdtoが同じディレクトリにあるため、関連ファイルを見つけやすい

4. **複数ドメインにまたがる機能の扱い**
   - `calendar`, `admin-calendar`, `work-summary`は独立したドメインとして扱う
   - これらは`application/calendar/`, `application/admin-calendar/`, `application/work-summary/`として既に独立している

### 移行手順

1. **Phase 1: ドメインごとのactionsを整理**
   ```
   presentation/actions/user/users.ts
   → presentation/user/actions/users.ts
   ```

2. **Phase 2: DTOをドメインごとに整理**
   ```
   presentation/dto/user-dto.ts
   → presentation/user/dto/user-dto.ts
   ```

3. **Phase 3: 複数ドメインにまたがる機能を整理**
   ```
   presentation/actions/calendar.ts
   → presentation/calendar/actions/calendar.ts
   ```

4. **Phase 4: import文を更新**
   - すべてのimport文を新しいパスに更新
   - ビルドエラーを修正

## 結論

**presentation層はドメインごとに統一することを推奨**します。

- application層との一貫性が保たれる
- ドメイン駆動設計の原則に合致
- 保守性と可読性が向上

infrastructure層は機能ごとに維持し、presentation層はドメインごとに整理することで、各レイヤーの役割が明確になります。


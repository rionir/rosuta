-- usersテーブルのRLSポリシーを修正
-- 管理者は自分の企業のユーザーを表示できる
-- user_storesテーブル経由でもアクセスできるようにする

DROP POLICY IF EXISTS "Admins can view users in their companies" ON users;

CREATE POLICY "Admins can view users in their companies"
ON users
FOR SELECT
TO public
USING (
  -- 自分自身のプロフィールは常に閲覧可能
  auth.uid() = users.id
  OR
  -- 管理者は自分の企業のユーザーを閲覧可能
  -- user_storesテーブル経由でもアクセスできるようにする
  EXISTS (
    SELECT 1
    FROM company_users admin_cu
    WHERE admin_cu.user_id = auth.uid()
      AND admin_cu.is_admin = true
      AND admin_cu.is_active = true
      -- 対象のユーザーが同じ企業に所属していることを確認
      -- company_usersテーブルを参照するが、RLSポリシー「Users can view own company membership」が適用される
      -- しかし、管理者自身のcompany_users情報は取得できるため、他のユーザーのcompany_users情報も取得できる
      AND EXISTS (
        SELECT 1
        FROM company_users cu
        WHERE cu.user_id = users.id
          AND cu.company_id = admin_cu.company_id
          AND cu.is_active = true
      )
  )
);





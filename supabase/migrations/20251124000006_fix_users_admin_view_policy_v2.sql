-- usersテーブルのRLSポリシーを修正
-- 管理者は自分の企業のユーザーを表示できる
-- user_storesテーブル経由でもアクセスできるようにする

DROP POLICY IF EXISTS "Admins can view users in their companies" ON users;

CREATE POLICY "Admins can view users in their companies"
ON users
FOR SELECT
TO public
USING (
  -- 現在のユーザーが管理者であることを確認
  -- かつ、対象のユーザーが同じ企業に所属していることを確認
  EXISTS (
    SELECT 1
    FROM company_users admin_cu
    WHERE admin_cu.user_id = auth.uid()
      AND admin_cu.is_admin = true
      AND admin_cu.is_active = true
      -- 対象のユーザーが同じ企業に所属していることを確認
      AND EXISTS (
        SELECT 1
        FROM company_users cu
        WHERE cu.user_id = users.id
          AND cu.company_id = admin_cu.company_id
          AND cu.is_active = true
      )
  )
);







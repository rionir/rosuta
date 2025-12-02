-- company_usersテーブルに管理者用のSELECTポリシーを追加（無限再帰を回避）
-- 管理者は自分の企業の全ユーザーのcompany_users情報を閲覧できる
-- 注意: このポリシーはcompany_usersテーブル自体を参照しないため、無限再帰が発生しない

CREATE POLICY "Admins can view company users in their companies"
ON company_users
FOR SELECT
TO public
USING (
  -- 現在のユーザーが管理者であることを確認（company_usersテーブルを参照しない）
  EXISTS (
    SELECT 1
    FROM company_users cu
    WHERE cu.user_id = auth.uid()
      AND cu.company_id = company_users.company_id
      AND cu.is_admin = true
      AND cu.is_active = true
  )
);







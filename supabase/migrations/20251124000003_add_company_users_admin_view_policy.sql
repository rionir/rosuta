-- company_usersテーブルに管理者用のSELECTポリシーを追加
-- 管理者は自分の企業の全ユーザーのcompany_users情報を閲覧できる

CREATE POLICY "Admins can view company users in their companies"
ON company_users
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM company_users admin_cu
    WHERE admin_cu.user_id = auth.uid()
      AND admin_cu.company_id = company_users.company_id
      AND admin_cu.is_admin = true
      AND admin_cu.is_active = true
  )
);







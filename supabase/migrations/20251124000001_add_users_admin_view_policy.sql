-- usersテーブルへのSELECTポリシーを追加
-- 管理者は自分の企業のユーザーを表示できる

CREATE POLICY "Admins can view users in their companies"
ON users
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM company_users cu
    WHERE cu.user_id = users.id
      AND EXISTS (
        SELECT 1
        FROM company_users admin_cu
        WHERE admin_cu.user_id = auth.uid()
          AND admin_cu.company_id = cu.company_id
          AND admin_cu.is_admin = true
          AND admin_cu.is_active = true
      )
  )
);





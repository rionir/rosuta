-- user_storesテーブルに管理者用のSELECTポリシーを追加
-- 管理者は自分の企業の店舗に所属する全ユーザーを閲覧できる

CREATE POLICY "Admins can view user stores in their companies"
ON user_stores
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM company_stores cs
    JOIN company_users cu ON cs.company_id = cu.company_id
    WHERE cs.id = user_stores.store_id
      AND cu.user_id = auth.uid()
      AND cu.is_admin = true
      AND cu.is_active = true
  )
);





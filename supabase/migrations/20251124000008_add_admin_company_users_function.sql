-- 管理者が自分の企業の全ユーザーのcompany_users情報を閲覧できるようにする関数
-- SECURITY DEFINERを使用してRLSをバイパスし、無限再帰を回避

CREATE OR REPLACE FUNCTION get_admin_company_ids()
RETURNS TABLE(company_id INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT cu.company_id
  FROM company_users cu
  WHERE cu.user_id = auth.uid()
    AND cu.is_admin = true
    AND cu.is_active = true;
END;
$$;

-- company_usersテーブルに管理者用のSELECTポリシーを追加（無限再帰を回避）
-- 関数を使用することで、company_usersテーブル自体を参照せずに管理者判定を行う

DROP POLICY IF EXISTS "Admins can view company users in their companies" ON company_users;

CREATE POLICY "Admins can view company users in their companies"
ON company_users
FOR SELECT
TO public
USING (
  -- 自分自身のcompany_users情報は常に閲覧可能
  user_id = auth.uid()
  OR
  -- 管理者は自分の企業の全ユーザーのcompany_users情報を閲覧可能
  company_id IN (
    SELECT company_id FROM get_admin_company_ids()
  )
);






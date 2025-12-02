-- shiftsテーブルへのINSERTポリシーを追加
-- 管理者は自分の企業の店舗に対してシフトを作成できる

CREATE POLICY "Admins can insert shifts in their companies"
ON shifts
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM company_users cu
    JOIN company_stores cs ON cu.company_id = cs.company_id
    WHERE cs.id = shifts.store_id
      AND cu.user_id = auth.uid()
      AND cu.is_admin = true
      AND cu.is_active = true
  )
);

-- shiftsテーブルへのUPDATEポリシーを追加
-- 管理者は自分の企業の店舗のシフトを更新できる

CREATE POLICY "Admins can update shifts in their companies"
ON shifts
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1
    FROM company_users cu
    JOIN company_stores cs ON cu.company_id = cs.company_id
    WHERE cs.id = shifts.store_id
      AND cu.user_id = auth.uid()
      AND cu.is_admin = true
      AND cu.is_active = true
  )
);

-- shiftsテーブルへのDELETEポリシーを追加
-- 管理者は自分の企業の店舗のシフトを削除できる

CREATE POLICY "Admins can delete shifts in their companies"
ON shifts
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1
    FROM company_users cu
    JOIN company_stores cs ON cu.company_id = cs.company_id
    WHERE cs.id = shifts.store_id
      AND cu.user_id = auth.uid()
      AND cu.is_admin = true
      AND cu.is_active = true
  )
);







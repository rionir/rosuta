-- 夜勤対応: shiftsテーブルとshift_breaksテーブルをTIMESTAMP型に変更
-- dateカラムを削除し、scheduled_start/scheduled_endをTIMESTAMP型に変更

-- 1. 既存データのバックアップとマイグレーション準備
-- 一時テーブルを作成して既存データを保存
CREATE TABLE IF NOT EXISTS shifts_backup AS SELECT * FROM shifts;
CREATE TABLE IF NOT EXISTS shift_breaks_backup AS SELECT * FROM shift_breaks;

-- 2. shift_breaksテーブルの更新（先に更新する必要がある）
-- break_startとbreak_endをTIMESTAMP型に変更
ALTER TABLE shift_breaks 
  ADD COLUMN IF NOT EXISTS break_start_ts TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS break_end_ts TIMESTAMP WITH TIME ZONE;

-- 既存データをマイグレーション（親シフトのdateと時刻を組み合わせてTIMESTAMPに変換）
UPDATE shift_breaks sb
SET 
  break_start_ts = (s.date::date + sb.break_start::time)::timestamp with time zone,
  break_end_ts = CASE 
    WHEN sb.break_end < sb.break_start THEN 
      -- 夜勤の場合、翌日の日付として設定
      (s.date::date + INTERVAL '1 day' + sb.break_end::time)::timestamp with time zone
    ELSE 
      (s.date::date + sb.break_end::time)::timestamp with time zone
  END
FROM shifts s
WHERE sb.shift_id = s.id;

-- 古いカラムを削除し、新しいカラムにリネーム
ALTER TABLE shift_breaks 
  DROP COLUMN IF EXISTS break_start,
  DROP COLUMN IF EXISTS break_end;

ALTER TABLE shift_breaks 
  RENAME COLUMN break_start_ts TO break_start;

ALTER TABLE shift_breaks 
  RENAME COLUMN break_end_ts TO break_end;

-- 3. shiftsテーブルの更新
-- scheduled_startとscheduled_endをTIMESTAMP型に変更
ALTER TABLE shifts 
  ADD COLUMN IF NOT EXISTS scheduled_start_ts TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS scheduled_end_ts TIMESTAMP WITH TIME ZONE;

-- 既存データをマイグレーション
UPDATE shifts
SET 
  scheduled_start_ts = (date::date + scheduled_start::time)::timestamp with time zone,
  scheduled_end_ts = CASE 
    WHEN scheduled_end < scheduled_start THEN 
      -- 夜勤の場合、翌日の日付として設定
      (date::date + INTERVAL '1 day' + scheduled_end::time)::timestamp with time zone
    ELSE 
      (date::date + scheduled_end::time)::timestamp with time zone
  END;

-- 古いカラムを削除し、新しいカラムにリネーム
ALTER TABLE shifts 
  DROP COLUMN IF EXISTS scheduled_start,
  DROP COLUMN IF EXISTS scheduled_end,
  DROP COLUMN IF EXISTS date;

ALTER TABLE shifts 
  RENAME COLUMN scheduled_start_ts TO scheduled_start;

ALTER TABLE shifts 
  RENAME COLUMN scheduled_end_ts TO scheduled_end;

-- 4. インデックスの更新
-- dateカラムのインデックスを削除
DROP INDEX IF EXISTS idx_shifts_date;

-- scheduled_startとscheduled_endにインデックスを追加
CREATE INDEX IF NOT EXISTS idx_shifts_scheduled_start ON shifts(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_shifts_scheduled_end ON shifts(scheduled_end);
CREATE INDEX IF NOT EXISTS idx_shifts_scheduled_start_date ON shifts((scheduled_start::date));

-- 5. バックアップテーブルを削除（マイグレーション確認後）
-- DROP TABLE IF EXISTS shifts_backup;
-- DROP TABLE IF EXISTS shift_breaks_backup;






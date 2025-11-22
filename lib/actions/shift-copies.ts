'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CopyShiftsInput {
  userId: string // 操作者（管理者）
  sourceDate: string // YYYY-MM-DD
  targetDate: string // YYYY-MM-DD
  storeId?: number // 店舗指定（オプション）
  overwrite: boolean // 既存シフトを上書きするか
}

/**
 * シフトをコピー（日/週/月コピー機能）
 */
export async function copyShifts(input: CopyShiftsInput) {
  const supabase = await createClient()

  // コピー元のシフトを取得
  let query = supabase
    .from('shifts')
    .select('*')
    .eq('date', input.sourceDate)

  if (input.storeId) {
    query = query.eq('store_id', input.storeId)
  }

  const { data: sourceShifts, error: fetchError } = await query

  if (fetchError) {
    return { error: fetchError.message }
  }

  if (!sourceShifts || sourceShifts.length === 0) {
    return { data: { copied: 0, skipped: 0 } }
  }

  // コピー先の既存シフトを確認
  let checkQuery = supabase
    .from('shifts')
    .select('id, user_id')
    .eq('date', input.targetDate)

  if (input.storeId) {
    checkQuery = checkQuery.eq('store_id', input.storeId)
  }

  const { data: existingShifts } = await checkQuery

  const existingShiftMap = new Map(
    existingShifts?.map((s) => [`${s.user_id}-${input.storeId || 'all'}`, s.id]) || []
  )

  let copied = 0
  let skipped = 0

  // 各シフトをコピー
  for (const sourceShift of sourceShifts) {
    const key = `${sourceShift.user_id}-${sourceShift.store_id}`
    const existingId = existingShiftMap.get(key)

    if (existingId && !input.overwrite) {
      skipped++
      continue
    }

    if (existingId && input.overwrite) {
      // 既存シフトを更新
      const { error: updateError } = await supabase
        .from('shifts')
        .update({
          scheduled_start: sourceShift.scheduled_start,
          scheduled_end: sourceShift.scheduled_end,
        })
        .eq('id', existingId)

      if (updateError) {
        return { error: updateError.message }
      }

      // 休憩もコピー
      const { data: sourceBreaks } = await supabase
        .from('shift_breaks')
        .select('*')
        .eq('shift_id', sourceShift.id)

      if (sourceBreaks && sourceBreaks.length > 0) {
        // 既存の休憩を削除
        await supabase.from('shift_breaks').delete().eq('shift_id', existingId)

        // 休憩をコピー
        const breaksToInsert = sourceBreaks.map((b) => ({
          shift_id: existingId,
          break_start: b.break_start,
          break_end: b.break_end,
        }))

        await supabase.from('shift_breaks').insert(breaksToInsert)
      }

      copied++
    } else {
      // 新規シフトを作成
      const { data: newShift, error: insertError } = await supabase
        .from('shifts')
        .insert({
          user_id: sourceShift.user_id,
          store_id: sourceShift.store_id,
          date: input.targetDate,
          scheduled_start: sourceShift.scheduled_start,
          scheduled_end: sourceShift.scheduled_end,
          created_by: input.userId,
        })
        .select()
        .single()

      if (insertError) {
        return { error: insertError.message }
      }

      // 休憩もコピー
      const { data: sourceBreaks } = await supabase
        .from('shift_breaks')
        .select('*')
        .eq('shift_id', sourceShift.id)

      if (sourceBreaks && sourceBreaks.length > 0) {
        const breaksToInsert = sourceBreaks.map((b) => ({
          shift_id: newShift.id,
          break_start: b.break_start,
          break_end: b.break_end,
        }))

        await supabase.from('shift_breaks').insert(breaksToInsert)
      }

      copied++
    }
  }

  // 操作記録を保存
  await supabase.from('shift_copies').insert({
    user_id: input.userId,
    source_date: input.sourceDate,
    target_date: input.targetDate,
    overwrite: input.overwrite,
  })

  revalidatePath('/admin/shifts')
  return { data: { copied, skipped } }
}


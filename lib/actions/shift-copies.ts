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

  // コピー元のシフトを取得（scheduled_startの日付でフィルタリング）
  let query = supabase
    .from('shifts')
    .select('*')
    .gte('scheduled_start', `${input.sourceDate}T00:00:00`)
    .lte('scheduled_start', `${input.sourceDate}T23:59:59`)

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

  // コピー先の既存シフトを確認（scheduled_startの日付でフィルタリング）
  let checkQuery = supabase
    .from('shifts')
    .select('id, user_id')
    .gte('scheduled_start', `${input.targetDate}T00:00:00`)
    .lte('scheduled_start', `${input.targetDate}T23:59:59`)

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
      // scheduled_startとscheduled_endの日付部分をtargetDateに変更
      const sourceStart = new Date(sourceShift.scheduled_start)
      const sourceEnd = new Date(sourceShift.scheduled_end)
      const targetStart = new Date(`${input.targetDate}T${sourceStart.toTimeString().split(' ')[0]}`)
      const targetEnd = new Date(`${input.targetDate}T${sourceEnd.toTimeString().split(' ')[0]}`)
      
      // 夜勤の場合、終了日を翌日に設定
      if (targetEnd < targetStart) {
        targetEnd.setDate(targetEnd.getDate() + 1)
      }
      
      const { error: updateError } = await supabase
        .from('shifts')
        .update({
          scheduled_start: targetStart.toISOString(),
          scheduled_end: targetEnd.toISOString(),
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

        // 休憩をコピー（日付部分をtargetDateに変更）
        const breaksToInsert = sourceBreaks.map((b) => {
          const breakStart = new Date(b.break_start)
          const breakEnd = new Date(b.break_end)
          const targetBreakStart = new Date(`${input.targetDate}T${breakStart.toTimeString().split(' ')[0]}`)
          const targetBreakEnd = new Date(`${input.targetDate}T${breakEnd.toTimeString().split(' ')[0]}`)
          
          // 夜勤の場合、終了時刻を翌日に設定
          if (targetBreakEnd < targetBreakStart) {
            targetBreakEnd.setDate(targetBreakEnd.getDate() + 1)
          }
          
          return {
            shift_id: existingId,
            break_start: targetBreakStart.toISOString(),
            break_end: targetBreakEnd.toISOString(),
          }
        })

        await supabase.from('shift_breaks').insert(breaksToInsert)
      }

      copied++
    } else {
      // 新規シフトを作成
      // scheduled_startとscheduled_endの日付部分をtargetDateに変更
      const sourceStart = new Date(sourceShift.scheduled_start)
      const sourceEnd = new Date(sourceShift.scheduled_end)
      const targetStart = new Date(`${input.targetDate}T${sourceStart.toTimeString().split(' ')[0]}`)
      const targetEnd = new Date(`${input.targetDate}T${sourceEnd.toTimeString().split(' ')[0]}`)
      
      // 夜勤の場合、終了日を翌日に設定
      if (targetEnd < targetStart) {
        targetEnd.setDate(targetEnd.getDate() + 1)
      }
      
      const { data: newShift, error: insertError } = await supabase
        .from('shifts')
        .insert({
          user_id: sourceShift.user_id,
          store_id: sourceShift.store_id,
          scheduled_start: targetStart.toISOString(),
          scheduled_end: targetEnd.toISOString(),
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
        // 休憩をコピー（日付部分をtargetDateに変更）
        const breaksToInsert = sourceBreaks.map((b) => {
          const breakStart = new Date(b.break_start)
          const breakEnd = new Date(b.break_end)
          const targetBreakStart = new Date(`${input.targetDate}T${breakStart.toTimeString().split(' ')[0]}`)
          const targetBreakEnd = new Date(`${input.targetDate}T${breakEnd.toTimeString().split(' ')[0]}`)
          
          // 夜勤の場合、終了時刻を翌日に設定
          if (targetBreakEnd < targetBreakStart) {
            targetBreakEnd.setDate(targetBreakEnd.getDate() + 1)
          }
          
          return {
            shift_id: newShift.id,
            break_start: targetBreakStart.toISOString(),
            break_end: targetBreakEnd.toISOString(),
          }
        })

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

  revalidatePath('/app/admin/shifts')
  return { data: { copied, skipped } }
}


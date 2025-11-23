'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateShiftBreakInput {
  shiftId: number
  breakStart: string // ISO 8601 TIMESTAMP
  breakEnd: string // ISO 8601 TIMESTAMP
}

export interface UpdateShiftBreakInput {
  breakId: number
  breakStart?: string
  breakEnd?: string
}

/**
 * 休憩を作成
 */
export async function createShiftBreak(input: CreateShiftBreakInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('shift_breaks')
    .insert({
      shift_id: input.shiftId,
      break_start: input.breakStart,
      break_end: input.breakEnd,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/shifts')
  revalidatePath('/app/admin/shifts')
  return { data }
}

/**
 * 休憩を更新
 */
export async function updateShiftBreak(input: UpdateShiftBreakInput) {
  const supabase = await createClient()

  const updates: { break_start?: string; break_end?: string } = {}
  if (input.breakStart) updates.break_start = input.breakStart
  if (input.breakEnd) updates.break_end = input.breakEnd

  const { data, error } = await supabase
    .from('shift_breaks')
    .update(updates)
    .eq('id', input.breakId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/shifts')
  revalidatePath('/app/admin/shifts')
  return { data }
}

/**
 * 休憩を削除
 */
export async function deleteShiftBreak(breakId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shift_breaks')
    .delete()
    .eq('id', breakId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/shifts')
  revalidatePath('/app/admin/shifts')
  return { data: { success: true } }
}

/**
 * シフトの休憩一覧を取得
 */
export async function getShiftBreaks(shiftId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('shift_breaks')
    .select('*')
    .eq('shift_id', shiftId)
    .order('break_start', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}


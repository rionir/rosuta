'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateShiftInput {
  userId: string
  storeId: number
  date: string // YYYY-MM-DD
  scheduledStart: string // HH:mm
  scheduledEnd: string // HH:mm
  createdBy: string
}

export interface UpdateShiftInput {
  shiftId: number
  scheduledStart?: string
  scheduledEnd?: string
}

/**
 * シフトを作成
 */
export async function createShift(input: CreateShiftInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('shifts')
    .insert({
      user_id: input.userId,
      store_id: input.storeId,
      date: input.date,
      scheduled_start: input.scheduledStart,
      scheduled_end: input.scheduledEnd,
      created_by: input.createdBy,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/shifts')
  revalidatePath('/admin/shifts')
  return { 
    data: { 
      id: data.id, 
      user_id: data.user_id, 
      store_id: data.store_id, 
      date: data.date, 
      scheduled_start: data.scheduled_start, 
      scheduled_end: data.scheduled_end, 
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at
    } 
  }
}

/**
 * シフトを更新
 */
export async function updateShift(input: UpdateShiftInput) {
  const supabase = await createClient()

  const updates: { scheduled_start?: string; scheduled_end?: string } = {}
  if (input.scheduledStart) updates.scheduled_start = input.scheduledStart
  if (input.scheduledEnd) updates.scheduled_end = input.scheduledEnd

  const { data, error } = await supabase
    .from('shifts')
    .update(updates)
    .eq('id', input.shiftId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/shifts')
  revalidatePath('/admin/shifts')
  return { data }
}

/**
 * シフトを削除
 */
export async function deleteShift(shiftId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shifts')
    .delete()
    .eq('id', shiftId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/shifts')
  revalidatePath('/admin/shifts')
  return { data: { success: true } }
}

/**
 * ユーザーのシフト一覧を取得（日付範囲指定）
 */
export async function getUserShifts(
  userId: string,
  startDate: string,
  endDate: string,
  storeId?: number
) {
  const supabase = await createClient()

  let query = supabase
    .from('shifts')
    .select(`
      *,
      company_stores (
        id,
        name
      )
    `)
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('scheduled_start', { ascending: true })

  if (storeId) {
    query = query.eq('store_id', storeId)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { data }
}

/**
 * 店舗のシフト一覧を取得（日付範囲指定）
 * 注意: ユーザー情報は含まれません。呼び出し側でstoreUsersからマージしてください。
 */
export async function getStoreShifts(
  storeId: number,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('store_id', storeId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('scheduled_start', { ascending: true })

  if (error) {
    console.error('getStoreShifts error:', error)
    return { error: error.message }
  }

  console.log('getStoreShifts result:', { storeId, startDate, endDate, count: data?.length || 0 })
  return { data: data || [] }
}


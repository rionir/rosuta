'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ClockRecordType = 'clock_in' | 'clock_out' | 'break_start' | 'break_end'
export type ClockRecordMethod = 'scheduled' | 'current' | 'manual'
export type ClockRecordStatus = 'pending' | 'approved' | 'rejected'

export interface CreateClockRecordInput {
  userId: string
  storeId: number
  shiftId?: number
  breakId?: number
  type: ClockRecordType
  selectedTime: string // ISO timestamp
  actualTime: string // ISO timestamp
  method: ClockRecordMethod
  createdBy: string
}

export interface UpdateClockRecordInput {
  recordId: number
  selectedTime?: string
  status?: ClockRecordStatus
  approvedBy?: string
}

/**
 * 打刻記録を作成
 */
export async function createClockRecord(input: CreateClockRecordInput) {
  const supabase = await createClient()

  // 店舗設定を確認して承認が必要かチェック
  const { data: settings } = await supabase
    .from('store_settings')
    .select('approval_required')
    .eq('store_id', input.storeId)
    .single()

  const status: ClockRecordStatus =
    settings?.approval_required === true ? 'pending' : 'approved'

  const { data, error } = await supabase
    .from('clock_records')
    .insert({
      user_id: input.userId,
      store_id: input.storeId,
      shift_id: input.shiftId,
      break_id: input.breakId,
      type: input.type,
      selected_time: input.selectedTime,
      actual_time: input.actualTime,
      method: input.method,
      status,
      created_by: input.createdBy,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/clock')
  revalidatePath('/admin/clock-records')
  return { data }
}

/**
 * 打刻記録を更新（承認制適用）
 */
export async function updateClockRecord(input: UpdateClockRecordInput) {
  const supabase = await createClient()

  // 既存の打刻記録を取得
  const { data: existingRecord, error: fetchError } = await supabase
    .from('clock_records')
    .select('*, store_id')
    .eq('id', input.recordId)
    .single()

  if (fetchError || !existingRecord) {
    return { error: fetchError?.message || 'Record not found' }
  }

  // 店舗設定を確認
  const { data: settings } = await supabase
    .from('store_settings')
    .select('approval_required')
    .eq('store_id', existingRecord.store_id)
    .single()

  const updates: {
    selected_time?: string
    status?: ClockRecordStatus
    approved_by?: string
  } = {}

  if (input.selectedTime) {
    updates.selected_time = input.selectedTime
    // 承認制の場合、編集時はpendingに戻す
    if (settings?.approval_required === true) {
      updates.status = 'pending'
      updates.approved_by = null
    }
  }

  if (input.status) {
    updates.status = input.status
    if (input.status === 'approved' && input.approvedBy) {
      updates.approved_by = input.approvedBy
    }
  }

  const { data, error } = await supabase
    .from('clock_records')
    .update(updates)
    .eq('id', input.recordId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/clock')
  revalidatePath('/admin/clock-records')
  return { data }
}

/**
 * 打刻記録を承認/却下
 */
export async function approveClockRecord(
  recordId: number,
  status: 'approved' | 'rejected',
  approvedBy: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clock_records')
    .update({
      status,
      approved_by: approvedBy,
    })
    .eq('id', recordId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/clock-records')
  return { data }
}

/**
 * ユーザーの打刻記録一覧を取得（日付範囲指定）
 */
export async function getUserClockRecords(
  userId: string,
  startDate: string,
  endDate: string,
  storeId?: number
) {
  const supabase = await createClient()

  let query = supabase
    .from('clock_records')
    .select(`
      *,
      company_stores (
        id,
        name
      )
    `)
    .eq('user_id', userId)
    .gte('selected_time', startDate)
    .lte('selected_time', endDate)
    .order('selected_time', { ascending: false })

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
 * 店舗の打刻記録一覧を取得（日付範囲指定）
 */
export async function getStoreClockRecords(
  storeId: number,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clock_records')
    .select(`
      *,
      users (
        id,
        name
      )
    `)
    .eq('store_id', storeId)
    .gte('selected_time', startDate)
    .lte('selected_time', endDate)
    .order('selected_time', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

/**
 * 承認待ちの打刻記録一覧を取得
 */
export async function getPendingClockRecords(storeId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clock_records')
    .select(`
      *,
      users (
        id,
        name
      )
    `)
    .eq('store_id', storeId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

/**
 * ユーザーの現在の勤務ステータスを取得
 */
export async function getCurrentWorkStatus(userId: string, storeId: number) {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  // 今日の打刻記録を取得（最新順）
  const { data: records, error } = await supabase
    .from('clock_records')
    .select('*')
    .eq('user_id', userId)
    .eq('store_id', storeId)
    .gte('selected_time', `${today}T00:00:00`)
    .lte('selected_time', `${today}T23:59:59`)
    .eq('status', 'approved')
    .order('selected_time', { ascending: false })
    .limit(10)

  if (error) {
    return { error: error.message }
  }

  // ステータスを判定
  let status: 'before_work' | 'working' | 'on_break' | 'finished' = 'before_work'
  let lastRecord = records?.[0]

  if (lastRecord) {
    if (lastRecord.type === 'clock_in') {
      status = 'working'
    } else if (lastRecord.type === 'break_start') {
      status = 'on_break'
    } else if (lastRecord.type === 'break_end') {
      status = 'working'
    } else if (lastRecord.type === 'clock_out') {
      status = 'finished'
    }
  }

  return { data: { status, lastRecord, records } }
}


import { SupabaseClient } from '@supabase/supabase-js'
import { Shift } from '@/domain/shift/entities/shift'
import { ShiftBreak } from '@/domain/shift/entities/shift-break'
import { IShiftRepository } from '@/domain/shift/repositories/shift-repository'

/**
 * SupabaseShiftRepository
 * IShiftRepositoryのSupabase実装
 */
export class SupabaseShiftRepository implements IShiftRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createShift(shift: Shift): Promise<Shift> {
    const { data, error } = await this.supabase
      .from('shifts')
      .insert({
        user_id: shift.userId,
        store_id: shift.storeId,
        scheduled_start: shift.scheduledStart.toISOString(),
        scheduled_end: shift.scheduledEnd.toISOString(),
        created_by: shift.createdBy,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create shift: ${error.message}`)
    }

    return new Shift(
      data.id,
      data.user_id,
      data.store_id,
      new Date(data.scheduled_start),
      new Date(data.scheduled_end),
      data.created_by,
      new Date(data.created_at),
      new Date(data.updated_at)
    )
  }

  async updateShift(shift: Shift): Promise<Shift> {
    const { error } = await this.supabase
      .from('shifts')
      .update({
        scheduled_start: shift.scheduledStart.toISOString(),
        scheduled_end: shift.scheduledEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', shift.id)

    if (error) {
      throw new Error(`Failed to update shift: ${error.message}`)
    }

    return shift
  }

  async deleteShift(shiftId: number): Promise<void> {
    const { error } = await this.supabase
      .from('shifts')
      .delete()
      .eq('id', shiftId)

    if (error) {
      throw new Error(`Failed to delete shift: ${error.message}`)
    }
  }

  async findById(shiftId: number): Promise<Shift | null> {
    const { data, error } = await this.supabase
      .from('shifts')
      .select('*')
      .eq('id', shiftId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to find shift: ${error.message}`)
    }

    if (!data) {
      return null
    }

    return new Shift(
      data.id,
      data.user_id,
      data.store_id,
      new Date(data.scheduled_start),
      new Date(data.scheduled_end),
      data.created_by,
      new Date(data.created_at),
      new Date(data.updated_at)
    )
  }

  async findUserShifts(
    userId: string,
    startDate: Date,
    endDate: Date,
    storeId?: number
  ): Promise<Shift[]> {
    let query = this.supabase
      .from('shifts')
      .select(`
        *,
        company_stores (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .gte('scheduled_start', startDate.toISOString())
      .lte('scheduled_start', endDate.toISOString())
      .order('scheduled_start', { ascending: true })

    if (storeId) {
      query = query.eq('store_id', storeId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to find user shifts: ${error.message}`)
    }

    return (data || []).map(
      (item: any) =>
        new Shift(
          item.id,
          item.user_id,
          item.store_id,
          new Date(item.scheduled_start),
          new Date(item.scheduled_end),
          item.created_by,
          new Date(item.created_at),
          new Date(item.updated_at)
        )
    )
  }

  async findStoreShifts(
    storeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Shift[]> {
    const { data, error } = await this.supabase
      .from('shifts')
      .select('id, user_id, store_id, scheduled_start, scheduled_end, created_by, created_at, updated_at')
      .eq('store_id', storeId)
      .gte('scheduled_start', startDate.toISOString())
      .lte('scheduled_start', endDate.toISOString())
      .order('scheduled_start', { ascending: true })

    if (error) {
      throw new Error(`Failed to find store shifts: ${error.message}`)
    }

    return (data || []).map(
      (item: any) =>
        new Shift(
          item.id,
          item.user_id,
          item.store_id,
          new Date(item.scheduled_start),
          new Date(item.scheduled_end),
          item.created_by,
          new Date(item.created_at),
          new Date(item.updated_at)
        )
    )
  }

  async createShiftBreak(shiftBreak: ShiftBreak): Promise<ShiftBreak> {
    const { data, error } = await this.supabase
      .from('shift_breaks')
      .insert({
        shift_id: shiftBreak.shiftId,
        break_start: shiftBreak.breakStart.toISOString(),
        break_end: shiftBreak.breakEnd.toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create shift break: ${error.message}`)
    }

    return new ShiftBreak(
      data.id,
      data.shift_id,
      new Date(data.break_start),
      new Date(data.break_end),
      new Date(data.created_at),
      new Date(data.updated_at)
    )
  }

  async updateShiftBreak(shiftBreak: ShiftBreak): Promise<ShiftBreak> {
    const { error } = await this.supabase
      .from('shift_breaks')
      .update({
        break_start: shiftBreak.breakStart.toISOString(),
        break_end: shiftBreak.breakEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', shiftBreak.id)

    if (error) {
      throw new Error(`Failed to update shift break: ${error.message}`)
    }

    return shiftBreak
  }

  async deleteShiftBreak(breakId: number): Promise<void> {
    const { error } = await this.supabase
      .from('shift_breaks')
      .delete()
      .eq('id', breakId)

    if (error) {
      throw new Error(`Failed to delete shift break: ${error.message}`)
    }
  }

  async findShiftBreaks(shiftId: number): Promise<ShiftBreak[]> {
    const { data, error } = await this.supabase
      .from('shift_breaks')
      .select('*')
      .eq('shift_id', shiftId)
      .order('break_start', { ascending: true })

    if (error) {
      throw new Error(`Failed to find shift breaks: ${error.message}`)
    }

    return (data || []).map(
      (item: any) =>
        new ShiftBreak(
          item.id,
          item.shift_id,
          new Date(item.break_start),
          new Date(item.break_end),
          new Date(item.created_at),
          new Date(item.updated_at)
        )
    )
  }

  async findBreakById(breakId: number): Promise<ShiftBreak | null> {
    const { data, error } = await this.supabase
      .from('shift_breaks')
      .select('*')
      .eq('id', breakId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to find shift break: ${error.message}`)
    }

    if (!data) {
      return null
    }

    return new ShiftBreak(
      data.id,
      data.shift_id,
      new Date(data.break_start),
      new Date(data.break_end),
      new Date(data.created_at),
      new Date(data.updated_at)
    )
  }

  async findShiftsByDateRange(
    date: Date,
    storeId?: number
  ): Promise<Shift[]> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    let query = this.supabase
      .from('shifts')
      .select('*')
      .gte('scheduled_start', startOfDay.toISOString())
      .lte('scheduled_start', endOfDay.toISOString())

    if (storeId) {
      query = query.eq('store_id', storeId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to find shifts by date range: ${error.message}`)
    }

    return (data || []).map(
      (item: any) =>
        new Shift(
          item.id,
          item.user_id,
          item.store_id,
          new Date(item.scheduled_start),
          new Date(item.scheduled_end),
          item.created_by,
          new Date(item.created_at),
          new Date(item.updated_at)
        )
    )
  }

  /**
   * ユーザーのシフト一覧を取得（店舗情報も含む）
   * 既存のUIとの互換性のため
   */
  async findUserShiftsWithStores(
    userId: string,
    startDate: Date,
    endDate: Date,
    storeId?: number
  ): Promise<any[]> {
    let query = this.supabase
      .from('shifts')
      .select(`
        *,
        company_stores (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .gte('scheduled_start', startDate.toISOString())
      .lte('scheduled_start', endDate.toISOString())
      .order('scheduled_start', { ascending: true })

    if (storeId) {
      query = query.eq('store_id', storeId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to find user shifts: ${error.message}`)
    }

    return data || []
  }
}


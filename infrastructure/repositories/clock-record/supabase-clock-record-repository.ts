import { SupabaseClient } from '@supabase/supabase-js'
import { ClockRecord } from '@/domain/clock-record/entities/clock-record'
import { IClockRecordRepository } from '@/domain/clock-record/repositories/clock-record-repository'
import { ClockRecordType } from '@/domain/clock-record/value-objects/clock-record-type'
import { ClockRecordMethod } from '@/domain/clock-record/value-objects/clock-record-method'
import { ClockRecordStatus } from '@/domain/clock-record/value-objects/clock-record-status'
import { Store } from '@/domain/store/entities/store'
import { User } from '@/domain/user/entities/user'

/**
 * SupabaseClockRecordRepository
 * IClockRecordRepositoryのSupabase実装
 */
export class SupabaseClockRecordRepository
  implements IClockRecordRepository
{
  constructor(private readonly supabase: SupabaseClient) {}

  async createClockRecord(clockRecord: ClockRecord): Promise<ClockRecord> {
    const { data, error } = await this.supabase
      .from('clock_records')
      .insert({
        user_id: clockRecord.userId,
        store_id: clockRecord.storeId,
        shift_id: clockRecord.shiftId,
        break_id: clockRecord.breakId,
        type: clockRecord.type,
        selected_time: clockRecord.selectedTime.toISOString(),
        actual_time: clockRecord.actualTime.toISOString(),
        method: clockRecord.method,
        status: clockRecord.status,
        created_by: clockRecord.createdBy,
        approved_by: clockRecord.approvedBy,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create clock record: ${error.message}`)
    }

    return this.mapToEntity(data)
  }

  async updateClockRecord(clockRecord: ClockRecord): Promise<ClockRecord> {
    const { error } = await this.supabase
      .from('clock_records')
      .update({
        selected_time: clockRecord.selectedTime.toISOString(),
        status: clockRecord.status,
        approved_by: clockRecord.approvedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clockRecord.id)

    if (error) {
      throw new Error(`Failed to update clock record: ${error.message}`)
    }

    return clockRecord
  }

  async findById(recordId: number): Promise<ClockRecord | null> {
    const { data, error } = await this.supabase
      .from('clock_records')
      .select('*')
      .eq('id', recordId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to find clock record: ${error.message}`)
    }

    if (!data) {
      return null
    }

    return this.mapToEntity(data)
  }

  async findUserClockRecords(
    userId: string,
    startDate: Date,
    endDate: Date,
    storeId?: number
  ): Promise<ClockRecord[]> {
    let query = this.supabase
      .from('clock_records')
      .select(`
        *,
        company_stores (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .gte('selected_time', startDate.toISOString())
      .lte('selected_time', endDate.toISOString())
      .order('selected_time', { ascending: false })

    if (storeId) {
      query = query.eq('store_id', storeId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to find user clock records: ${error.message}`)
    }

    return (data || []).map((item: any) => this.mapToEntity(item))
  }

  async findStoreClockRecords(
    storeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<ClockRecord[]> {
    const { data, error } = await this.supabase
      .from('clock_records')
      .select(`
        id,
        user_id,
        store_id,
        shift_id,
        break_id,
        type,
        selected_time,
        actual_time,
        method,
        status,
        created_by,
        approved_by,
        created_at,
        updated_at,
        users!clock_records_user_id_fkey (
          id,
          last_name,
          first_name
        )
      `)
      .eq('store_id', storeId)
      .gte('selected_time', startDate.toISOString())
      .lte('selected_time', endDate.toISOString())
      .order('selected_time', { ascending: false })

    if (error) {
      throw new Error(`Failed to find store clock records: ${error.message}`)
    }

    return (data || []).map((item: any) => this.mapToEntity(item))
  }

  async findPendingClockRecords(storeId: number): Promise<ClockRecord[]> {
    const { data, error } = await this.supabase
      .from('clock_records')
      .select(`
        *,
        users!clock_records_user_id_fkey (
          id,
          last_name,
          first_name
        )
      `)
      .eq('store_id', storeId)
      .eq('status', ClockRecordStatus.PENDING)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to find pending clock records: ${error.message}`)
    }

    return (data || []).map((item: any) => this.mapToEntity(item))
  }

  async findTodayApprovedClockRecords(
    userId: string,
    storeId: number,
    date: Date
  ): Promise<ClockRecord[]> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data, error } = await this.supabase
      .from('clock_records')
      .select('*')
      .eq('user_id', userId)
      .eq('store_id', storeId)
      .gte('selected_time', startOfDay.toISOString())
      .lte('selected_time', endOfDay.toISOString())
      .eq('status', ClockRecordStatus.APPROVED)
      .order('selected_time', { ascending: false })
      .limit(10)

    if (error) {
      throw new Error(
        `Failed to find today approved clock records: ${error.message}`
      )
    }

    return (data || []).map((item: any) => this.mapToEntity(item))
  }

  async findTodayPendingClockRecords(
    userId: string,
    storeId: number,
    date: Date
  ): Promise<ClockRecord[]> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data, error } = await this.supabase
      .from('clock_records')
      .select('*')
      .eq('user_id', userId)
      .eq('store_id', storeId)
      .gte('selected_time', startOfDay.toISOString())
      .lte('selected_time', endOfDay.toISOString())
      .eq('status', ClockRecordStatus.PENDING)
      .order('selected_time', { ascending: false })
      .limit(1)

    if (error) {
      throw new Error(
        `Failed to find today pending clock records: ${error.message}`
      )
    }

    return (data || []).map((item: any) => this.mapToEntity(item))
  }

  /**
   * データベースのレコードをエンティティにマッピング
   */
  private mapToEntity(data: any): ClockRecord {
    return new ClockRecord(
      data.id,
      data.user_id,
      data.store_id,
      data.shift_id,
      data.break_id,
      data.type as ClockRecordType,
      new Date(data.selected_time),
      new Date(data.actual_time),
      data.method as ClockRecordMethod,
      data.status as ClockRecordStatus,
      data.created_by,
      data.approved_by,
      new Date(data.created_at),
      new Date(data.updated_at)
    )
  }

  /**
   * ユーザーの打刻記録一覧を取得（店舗情報も含む）
   */
  async findUserClockRecordsWithStores(
    userId: string,
    startDate: Date,
    endDate: Date,
    storeId?: number
  ): Promise<Array<{ clockRecord: ClockRecord; store: Store | null }>> {
    let query = this.supabase
      .from('clock_records')
      .select(`
        *,
        company_stores (
          id,
          company_id,
          name,
          address,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .gte('selected_time', startDate.toISOString())
      .lte('selected_time', endDate.toISOString())
      .order('selected_time', { ascending: false })

    if (storeId) {
      query = query.eq('store_id', storeId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to find user clock records: ${error.message}`)
    }

    return (data || []).map((item: {
      id: number
      user_id: string
      store_id: number
      shift_id: number | null
      break_id: number | null
      type: string
      selected_time: string
      actual_time: string
      method: string
      status: string
      created_by: string
      approved_by: string | null
      created_at: string
      updated_at: string
      company_stores: Array<{
        id: number
        company_id: number
        name: string
        address: string | null
        created_at: string
        updated_at: string
      }> | {
        id: number
        company_id: number
        name: string
        address: string | null
        created_at: string
        updated_at: string
      } | null
    }) => {
      const clockRecord = this.mapToEntity(item)
      
      // company_storesが配列の場合、最初の要素を取得（1対1の関係なので）
      const storeData = Array.isArray(item.company_stores) ? item.company_stores[0] || null : item.company_stores
      const store = storeData ? new Store(
        storeData.id,
        storeData.company_id,
        storeData.name,
        storeData.address,
        new Date(storeData.created_at),
        new Date(storeData.updated_at)
      ) : null

      return { clockRecord, store }
    })
  }

  /**
   * 店舗の打刻記録一覧を取得（ユーザー情報も含む）
   */
  async findStoreClockRecordsWithUsers(
    storeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ clockRecord: ClockRecord; user: User | null }>> {
    const { data, error } = await this.supabase
      .from('clock_records')
      .select(`
        *,
        users!clock_records_user_id_fkey (
          id,
          last_name,
          first_name,
          created_at,
          updated_at
        )
      `)
      .eq('store_id', storeId)
      .gte('selected_time', startDate.toISOString())
      .lte('selected_time', endDate.toISOString())
      .order('selected_time', { ascending: false })

    if (error) {
      throw new Error(`Failed to find store clock records: ${error.message}`)
    }

    return (data || []).map((item: {
      id: number
      user_id: string
      store_id: number
      shift_id: number | null
      break_id: number | null
      type: string
      selected_time: string
      actual_time: string
      method: string
      status: string
      created_by: string
      approved_by: string | null
      created_at: string
      updated_at: string
      users: Array<{
        id: string
        last_name: string
        first_name: string
        created_at: string
        updated_at: string
      }> | {
        id: string
        last_name: string
        first_name: string
        created_at: string
        updated_at: string
      } | null
    }) => {
      const clockRecord = this.mapToEntity(item)
      
      // usersが配列の場合、最初の要素を取得（1対1の関係なので）
      const userData = Array.isArray(item.users) ? item.users[0] || null : item.users
      const user = userData ? new User(
        userData.id,
        userData.last_name,
        userData.first_name,
        new Date(userData.created_at),
        new Date(userData.updated_at)
      ) : null

      return { clockRecord, user }
    })
  }

  /**
   * 承認待ちの打刻記録一覧を取得（ユーザー情報も含む）
   * 既存のUIとの互換性のため
   */
  async findPendingClockRecordsWithUsers(storeId: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('clock_records')
      .select(`
        *,
        users!clock_records_user_id_fkey (
          id,
          last_name,
          first_name
        )
      `)
      .eq('store_id', storeId)
      .eq('status', ClockRecordStatus.PENDING)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to find pending clock records: ${error.message}`)
    }

    return data || []
  }
}


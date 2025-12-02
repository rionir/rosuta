import { IClockRecordRepository } from '@/domain/clock-record/repositories/clock-record-repository'
import { ClockRecord } from '@/domain/clock-record/entities/clock-record'
import { ClockRecordType, createClockRecordType } from '@/domain/clock-record/value-objects/clock-record-type'
import { ClockRecordMethod, createClockRecordMethod } from '@/domain/clock-record/value-objects/clock-record-method'
import { ClockRecordStatus } from '@/domain/clock-record/value-objects/clock-record-status'
import { ClockRecordService } from '@/domain/clock-record/services/clock-record-service'
import { CreateClockRecordDTO } from '../dto/create-clock-record-dto'
import { SupabaseClient } from '@supabase/supabase-js'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError, ExternalServiceError } from '@/domain/common/errors'

/**
 * CreateClockRecordUseCase
 * 打刻記録作成のユースケース
 * 店舗設定に基づいて承認ステータスを決定
 */
export class CreateClockRecordUseCase {
  constructor(
    private readonly clockRecordRepository: IClockRecordRepository,
    private readonly supabase: SupabaseClient
  ) {}

  async execute(
    dto: CreateClockRecordDTO
  ): Promise<Result<ClockRecord>> {
    try {
      // バリデーション
      if (!dto.userId) {
        return R.failure(
          new ValidationError('ユーザーIDが指定されていません', 'userId')
        )
      }

      if (!dto.storeId || dto.storeId <= 0) {
        return R.failure(
          new ValidationError('店舗IDが無効です', 'storeId')
        )
      }

      if (!dto.selectedTime || !dto.actualTime) {
        return R.failure(
          new ValidationError('選択時刻と実際の時刻を指定してください', 'time')
        )
      }

      const selectedTime = new Date(dto.selectedTime)
      const actualTime = new Date(dto.actualTime)

      if (isNaN(selectedTime.getTime()) || isNaN(actualTime.getTime())) {
        return R.failure(
          new ValidationError('無効な日時形式です', 'time')
        )
      }

      if (!dto.createdBy) {
        return R.failure(
          new ValidationError('作成者IDが指定されていません', 'createdBy')
        )
      }

      // 店舗設定を確認して承認が必要かチェック
      const { data: settings, error: settingsError } = await this.supabase
        .from('store_settings')
        .select('approval_required')
        .eq('store_id', dto.storeId)
        .single()

      if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116は「行が見つからない」エラー
        return R.failure(
          new ExternalServiceError('Supabase', `店舗設定の取得に失敗しました: ${settingsError.message}`)
        )
      }

      const approvalRequired = settings?.approval_required === true
      const status = ClockRecordService.determineInitialStatus(approvalRequired)

      const clockRecord = new ClockRecord(
        0, // IDはDBで生成されるため0を設定
        dto.userId,
        dto.storeId,
        dto.shiftId || null,
        dto.breakId || null,
        createClockRecordType(dto.type),
        selectedTime,
        actualTime,
        createClockRecordMethod(dto.method),
        status,
        dto.createdBy,
        null,
        new Date(),
        new Date()
      )

      const createdRecord = await this.clockRecordRepository.createClockRecord(
        clockRecord
      )

      return R.success(createdRecord)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '打刻記録の作成に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


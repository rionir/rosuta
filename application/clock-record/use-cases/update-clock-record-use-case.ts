import { IClockRecordRepository } from '@/domain/clock-record/repositories/clock-record-repository'
import { ClockRecordStatus, createClockRecordStatus } from '@/domain/clock-record/value-objects/clock-record-status'
import { ClockRecordService } from '@/domain/clock-record/services/clock-record-service'
import { UpdateClockRecordDTO } from '../dto/update-clock-record-dto'
import { SupabaseClient } from '@supabase/supabase-js'
import { Result, Result as R } from '@/domain/common/result'
import { NotFoundError, ValidationError, DatabaseError, ExternalServiceError } from '@/domain/common/errors'
import { ClockRecord } from '@/domain/clock-record/entities/clock-record'

/**
 * UpdateClockRecordUseCase
 * 打刻記録更新のユースケース（承認制適用）
 */
export class UpdateClockRecordUseCase {
  constructor(
    private readonly clockRecordRepository: IClockRecordRepository,
    private readonly supabase: SupabaseClient
  ) {}

  async execute(
    dto: UpdateClockRecordDTO
  ): Promise<Result<ClockRecord>> {
    try {
      // バリデーション
      if (!dto.recordId || dto.recordId <= 0) {
        return R.failure(
          new ValidationError('打刻記録IDが無効です', 'recordId')
        )
      }

      // 既存の打刻記録を取得
      const existingRecord = await this.clockRecordRepository.findById(
        dto.recordId
      )

      if (!existingRecord) {
        return R.failure(
          new NotFoundError('打刻記録', dto.recordId)
        )
      }

      // 店舗設定を確認
      const { data: settings, error: settingsError } = await this.supabase
        .from('store_settings')
        .select('approval_required')
        .eq('store_id', existingRecord.storeId)
        .single()

      if (settingsError && settingsError.code !== 'PGRST116') {
        return R.failure(
          new ExternalServiceError('Supabase', `店舗設定の取得に失敗しました: ${settingsError.message}`)
        )
      }

      const approvalRequired = settings?.approval_required === true

      let updatedRecord = existingRecord

      if (dto.selectedTime) {
        const selectedTime = new Date(dto.selectedTime)
        if (isNaN(selectedTime.getTime())) {
          return R.failure(
            new ValidationError('無効な選択時刻形式です', 'selectedTime')
          )
        }
        updatedRecord = updatedRecord.updateSelectedTime(selectedTime)

        // 承認制の場合、編集時はpendingに戻す
        if (
          ClockRecordService.shouldResetToPendingOnEdit(
            approvalRequired,
            updatedRecord.status
          )
        ) {
          updatedRecord = updatedRecord.resetToPending()
        }
      }

      if (dto.status) {
        const status = createClockRecordStatus(dto.status)
        if (!dto.approvedBy && (dto.status === 'approved' || dto.status === 'rejected')) {
          return R.failure(
            new ValidationError('承認/却下時は承認者IDが必要です', 'approvedBy')
          )
        }
        updatedRecord = updatedRecord.updateStatus(
          status,
          dto.approvedBy || null
        )
      }

      const result = await this.clockRecordRepository.updateClockRecord(
        updatedRecord
      )

      return R.success(result)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '打刻記録の更新に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


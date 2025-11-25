'use client'

import { useState } from 'react'
import { createClockRecord } from '@/lib/actions/clock-records'
import { useRouter } from 'next/navigation'
import TimeSelectModal from './TimeSelectModal'
import StoreSelect from './StoreSelect'

interface ClockComponentProps {
  user: {
    id: string
    email?: string
    profile?: {
      name: string
    }
  }
  stores: Array<{
    store_id: number
    company_stores: {
      id: number
      name: string
    }
  }>
  selectedStoreId: number
  workStatus: {
    status: 'before_work' | 'working' | 'on_break' | 'finished'
    lastRecord?: any
    records?: any[]
  } | null
}

export default function ClockComponent({
  user,
  stores,
  selectedStoreId,
  workStatus,
}: ClockComponentProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clockType, setClockType] = useState<
    'clock_in' | 'clock_out' | 'break_start' | 'break_end' | null
  >(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleClockClick = (type: typeof clockType) => {
    setClockType(type)
    setIsModalOpen(true)
  }

  const handleTimeSelect = async (
    selectedTime: Date,
    method: 'scheduled' | 'current' | 'manual'
  ) => {
    if (!clockType) return

    setIsLoading(true)
    try {
      const actualTime = new Date()

      const result = await createClockRecord({
        userId: user.id,
        storeId: selectedStoreId,
        type: clockType,
        selectedTime: selectedTime.toISOString(),
        actualTime: actualTime.toISOString(),
        method,
        createdBy: user.id,
      })

      if (result?.error) {
        console.error('打刻エラー:', result.error)
        alert(`打刻に失敗しました: ${result.error}`)
        return
      }

      setIsModalOpen(false)
      router.refresh()
    } catch (error) {
      console.error('打刻エラー:', error)
      alert(`打刻に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const status = workStatus?.status || 'before_work'

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <StoreSelect stores={stores} selectedStoreId={selectedStoreId} />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
        <div className="border-b border-blue-100 bg-blue-50 px-8 py-7">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">打刻</h2>
        </div>

        <div className="p-8">
          <div className="mb-10 rounded-xl bg-blue-50 border border-blue-100 p-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-600">現在のステータス</p>
            <p className="text-3xl font-bold text-gray-900">
              {status === 'before_work' && '出勤前'}
              {status === 'working' && '勤務中'}
              {status === 'on_break' && '休憩中'}
              {status === 'finished' && '退勤済み'}
            </p>
          </div>

          <div className="space-y-4">
            {status === 'before_work' && (
              <button
                onClick={() => handleClockClick('clock_in')}
                disabled={isLoading}
                className="w-full rounded-xl bg-blue-600 px-8 py-5 text-lg font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                出勤
              </button>
            )}

            {status === 'working' && (
              <>
                <button
                  onClick={() => handleClockClick('break_start')}
                  disabled={isLoading}
                  className="w-full rounded-xl bg-blue-500 px-8 py-5 text-lg font-semibold text-white shadow-sm transition-all hover:bg-blue-600 hover:shadow-md hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  休憩開始
                </button>
                <button
                  onClick={() => handleClockClick('clock_out')}
                  disabled={isLoading}
                  className="w-full rounded-xl bg-blue-700 px-8 py-5 text-lg font-semibold text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow-md hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  退勤
                </button>
              </>
            )}

            {status === 'on_break' && (
              <button
                onClick={() => handleClockClick('break_end')}
                disabled={isLoading}
                className="w-full rounded-xl bg-blue-600 px-8 py-5 text-lg font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                休憩終了
              </button>
            )}

            {status === 'finished' && (
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-lg font-medium text-gray-700">本日の打刻は完了しました</p>
                <p className="mt-2 text-sm text-gray-500">お疲れ様でした</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && clockType && (
        <TimeSelectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleTimeSelect}
          type={clockType}
        />
      )}
    </div>
  )
}


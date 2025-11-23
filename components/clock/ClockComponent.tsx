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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-4">
          <StoreSelect stores={stores} selectedStoreId={selectedStoreId} />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-900">打刻</h2>

          <div className="mb-6">
            <p className="text-sm text-gray-600">現在のステータス</p>
            <p className="text-lg font-semibold text-gray-900">
              {status === 'before_work' && '出勤前'}
              {status === 'working' && '勤務中'}
              {status === 'on_break' && '休憩中'}
              {status === 'finished' && '退勤済み'}
            </p>
          </div>

          <div className="space-y-3">
            {status === 'before_work' && (
              <button
                onClick={() => handleClockClick('clock_in')}
                disabled={isLoading}
                className="w-full rounded-md bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                出勤
              </button>
            )}

            {status === 'working' && (
              <>
                <button
                  onClick={() => handleClockClick('break_start')}
                  disabled={isLoading}
                  className="w-full rounded-md bg-green-600 px-4 py-3 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  休憩開始
                </button>
                <button
                  onClick={() => handleClockClick('clock_out')}
                  disabled={isLoading}
                  className="w-full rounded-md bg-red-600 px-4 py-3 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  退勤
                </button>
              </>
            )}

            {status === 'on_break' && (
              <button
                onClick={() => handleClockClick('break_end')}
                disabled={isLoading}
                className="w-full rounded-md bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                休憩終了
              </button>
            )}

            {status === 'finished' && (
              <p className="text-center text-gray-500">本日の打刻は完了しました</p>
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


'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  getUserWorkSummaryByDay,
  getUserWorkSummaryByWeek,
  getUserWorkSummaryByMonth,
} from '@/presentation/work-summary/actions/work-summary'
import { UserStoreWithStoreDTO } from '@/presentation/store/dto/store-dto'

interface WorkSummaryComponentProps {
  user: {
    id: string
    email?: string
    profile?: {
      name: string
    }
  }
  stores: UserStoreWithStoreDTO[]
  year: number
  month: number
  selectedStoreId?: number
  period: 'day' | 'week' | 'month'
}

export default function WorkSummaryComponent({
  user,
  stores,
  year,
  month,
  selectedStoreId,
  period,
}: WorkSummaryComponentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [summaryData, setSummaryData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSummary() {
      setIsLoading(true)
      try {
        let result
        if (period === 'day') {
          const startDate = new Date(year, month - 1, 1)
          const endDate = new Date(year, month, 0)
          const startDateStr = startDate.toISOString().split('T')[0]
          const endDateStr = endDate.toISOString().split('T')[0]
          result = await getUserWorkSummaryByDay(user.id, startDateStr, endDateStr, selectedStoreId)
        } else if (period === 'week') {
          result = await getUserWorkSummaryByWeek(user.id, year, month, selectedStoreId)
        } else {
          result = await getUserWorkSummaryByMonth(user.id, year, month, selectedStoreId)
        }

        if (result.data) {
          setSummaryData(result.data)
        } else if (result.error) {
          console.error('勤務実績の取得エラー:', result.error)
        }
      } catch (error) {
        console.error('勤務実績の取得エラー:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSummary()
  }, [user.id, year, month, selectedStoreId, period])

  const handlePeriodChange = (newPeriod: 'day' | 'week' | 'month') => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', newPeriod)
    router.push(`/summary?${params.toString()}`)
  }

  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 2, 1)
    const params = new URLSearchParams(searchParams.toString())
    params.set('year', newDate.getFullYear().toString())
    params.set('month', (newDate.getMonth() + 1).toString())
    router.push(`/summary?${params.toString()}`)
  }

  const handleNextMonth = () => {
    const newDate = new Date(year, month, 1)
    const params = new URLSearchParams(searchParams.toString())
    params.set('year', newDate.getFullYear().toString())
    params.set('month', (newDate.getMonth() + 1).toString())
    router.push(`/summary?${params.toString()}`)
  }

  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}時間${mins}分`
  }

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ]

  const handleStoreChange = (storeId: number | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    if (storeId) {
      params.set('storeId', storeId.toString())
    } else {
      params.delete('storeId')
    }
    router.push(`/summary?${params.toString()}`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-blue-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            店舗選択
          </label>
          <select
            value={selectedStoreId || ''}
            onChange={(e) => handleStoreChange(e.target.value ? parseInt(e.target.value) : undefined)}
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400"
          >
            <option value="">すべての店舗</option>
            {stores
              .filter((store) => store.company_stores !== null)
              .map((store) => (
                <option key={store.store_id} value={store.store_id}>
                  {store.company_stores!.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
        <div className="border-b border-blue-100 bg-blue-50 px-8 py-7">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {year}年 {monthNames[month - 1]} 勤務実績
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevMonth}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-100 hover:text-blue-700"
              >
                ← 前月
              </button>
              <button
                onClick={() => {
                  const today = new Date()
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('year', today.getFullYear().toString())
                  params.set('month', (today.getMonth() + 1).toString())
                  router.push(`/summary?${params.toString()}`)
                }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-100 hover:text-blue-700"
              >
                今月
              </button>
              <button
                onClick={handleNextMonth}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-100 hover:text-blue-700"
              >
                次月 →
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* 期間選択 */}
          <div className="mb-6 flex space-x-2">
            <button
              onClick={() => handlePeriodChange('day')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                period === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              日別
            </button>
            <button
              onClick={() => handlePeriodChange('week')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                period === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              週別
            </button>
            <button
              onClick={() => handlePeriodChange('month')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                period === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              月別
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">読み込み中...</div>
            </div>
          ) : summaryData ? (
            <div className="space-y-6">
              {/* サマリーカード */}
              {period === 'month' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
                    <div className="text-sm font-medium text-gray-600">予定時間</div>
                    <div className="mt-2 text-2xl font-bold text-gray-900">
                      {formatMinutes(summaryData.scheduledHours)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-green-200 bg-green-50 p-6">
                    <div className="text-sm font-medium text-gray-600">実際の勤務時間</div>
                    <div className="mt-2 text-2xl font-bold text-gray-900">
                      {formatMinutes(summaryData.actualHours)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                    <div className="text-sm font-medium text-gray-600">差</div>
                    <div className={`mt-2 text-2xl font-bold ${
                      summaryData.actualHours - summaryData.scheduledHours >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {formatMinutes(summaryData.actualHours - summaryData.scheduledHours)}
                    </div>
                  </div>
                </div>
              )}

              {/* 詳細リスト */}
              {period === 'day' && Array.isArray(summaryData) && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          日付
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          予定時間
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          実際の時間
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          差
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {summaryData.map((day: any) => (
                        <tr key={day.date}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                            {day.date}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {formatMinutes(day.scheduledHours)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {formatMinutes(day.actualHours)}
                          </td>
                          <td className={`whitespace-nowrap px-6 py-4 text-sm font-medium ${
                            day.actualHours - day.scheduledHours >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {formatMinutes(day.actualHours - day.scheduledHours)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {period === 'week' && Array.isArray(summaryData) && (
                <div className="space-y-4">
                  {summaryData.map((week: any) => (
                    <div key={week.weekStart} className="rounded-xl border border-gray-200 bg-white p-6">
                      <div className="mb-4 text-lg font-semibold text-gray-900">
                        {week.weekStart} 〜 {week.weekEnd}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">予定時間</div>
                          <div className="text-xl font-bold text-gray-900">
                            {formatMinutes(week.scheduledHours)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">実際の時間</div>
                          <div className="text-xl font-bold text-gray-900">
                            {formatMinutes(week.actualHours)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">差</div>
                          <div className={`text-xl font-bold ${
                            week.actualHours - week.scheduledHours >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {formatMinutes(week.actualHours - week.scheduledHours)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500">データがありません</div>
          )}
        </div>
      </div>
    </div>
  )
}


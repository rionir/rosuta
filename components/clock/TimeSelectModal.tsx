'use client'

import { useState } from 'react'
import { format } from 'date-fns'

interface TimeSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (time: Date, method: 'scheduled' | 'current' | 'manual') => void
  type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end'
}

export default function TimeSelectModal({
  isOpen,
  onClose,
  onSelect,
  type,
}: TimeSelectModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<
    'scheduled' | 'current' | 'manual'
  >('current')
  const [manualTime, setManualTime] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    let selectedTime: Date

    if (selectedMethod === 'current') {
      selectedTime = new Date()
    } else if (selectedMethod === 'manual') {
      if (!manualTime) {
        alert('時刻を入力してください')
        return
      }
      const [hours, minutes] = manualTime.split(':')
      selectedTime = new Date()
      selectedTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    } else {
      // scheduled - シフト予定時刻を使用（実装は後で）
      selectedTime = new Date()
    }

    onSelect(selectedTime, selectedMethod)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          {type === 'clock_in' && '出勤'}
          {type === 'clock_out' && '退勤'}
          {type === 'break_start' && '休憩開始'}
          {type === 'break_end' && '休憩終了'}時刻を選択
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              選択方法
            </label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="method"
                  value="current"
                  checked={selectedMethod === 'current'}
                  onChange={() => setSelectedMethod('current')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  現在時刻 ({format(new Date(), 'HH:mm')})
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="method"
                  value="scheduled"
                  checked={selectedMethod === 'scheduled'}
                  onChange={() => setSelectedMethod('scheduled')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">シフト予定時刻</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="method"
                  value="manual"
                  checked={selectedMethod === 'manual'}
                  onChange={() => setSelectedMethod('manual')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">手動入力</span>
              </label>
            </div>
          </div>

          {selectedMethod === 'manual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                時刻
              </label>
              <input
                type="time"
                value={manualTime}
                onChange={(e) => setManualTime(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              確定
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


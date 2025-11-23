'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface StoreSelectProps {
  stores: Array<{
    store_id: number
    company_stores: {
      id: number
      name: string
    }
  }>
  selectedStoreId?: number
}

export default function CalendarStoreSelect({ stores, selectedStoreId }: StoreSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleStoreChange = (storeId: number | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    if (storeId) {
      params.set('storeId', storeId.toString())
    } else {
      params.delete('storeId')
    }
    router.push(`/shifts?${params.toString()}`)
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-blue-100">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        店舗選択
      </label>
      <select
        value={selectedStoreId || ''}
        onChange={(e) => handleStoreChange(e.target.value ? parseInt(e.target.value) : undefined)}
        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400"
      >
        <option value="">すべての店舗</option>
        {stores.map((store) => (
          <option key={store.store_id} value={store.store_id}>
            {store.company_stores.name}
          </option>
        ))}
      </select>
    </div>
  )
}





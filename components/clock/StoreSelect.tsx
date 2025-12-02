'use client'

import { useRouter } from 'next/navigation'

import { UserStoreWithStoreDTO } from '@/presentation/store/dto/store-dto'

interface StoreSelectProps {
  stores: UserStoreWithStoreDTO[]
  selectedStoreId: number
}

export default function StoreSelect({ stores, selectedStoreId }: StoreSelectProps) {
  const router = useRouter()

  const handleStoreChange = (storeId: number) => {
    router.push(`/clock?storeId=${storeId}`)
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <label className="block text-sm font-medium text-gray-700">
        店舗選択
      </label>
      <select
        value={selectedStoreId}
        onChange={(e) => handleStoreChange(parseInt(e.target.value))}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
      >
        {stores
          .filter((store) => store.company_stores !== null)
          .map((store) => (
            <option key={store.store_id} value={store.store_id}>
              {store.company_stores!.name}
            </option>
          ))}
      </select>
    </div>
  )
}


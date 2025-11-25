'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createStore, updateStore } from '@/lib/actions/stores'

interface StoresManagementComponentProps {
  user: {
    id: string
    email?: string
    profile?: {
      name: string
    }
  }
  companyId: number
  stores: Array<{
    id: number
    name: string
    address?: string
    created_at: string
  }>
}

export default function StoresManagementComponent({
  user,
  companyId,
  stores,
}: StoresManagementComponentProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const name = formData.get('name') as string
      const address = formData.get('address') as string

      if (!name) {
        setError('店舗名を入力してください')
        setIsLoading(false)
        return
      }

      const result = await createStore({
        companyId,
        name,
        address: address || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setIsCreating(false)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '店舗の作成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (storeId: number, formData: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const name = formData.get('name') as string
      const address = formData.get('address') as string

      if (!name) {
        setError('店舗名を入力してください')
        setIsLoading(false)
        return
      }

      const result = await updateStore({
        storeId,
        name,
        address: address || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setEditingId(null)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '店舗の更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">店舗管理</h1>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
          >
            + 店舗を追加
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* 新規作成フォーム */}
      {isCreating && (
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
          <div className="border-b border-blue-100 bg-blue-50 px-8 py-7">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">新規店舗追加</h2>
          </div>
          <form action={handleCreate} className="p-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  店舗名 <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  住所
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '作成中...' : '作成'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false)
                    setError(null)
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 店舗一覧 */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
        <div className="border-b border-blue-100 bg-blue-50 px-8 py-7">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">店舗一覧</h2>
        </div>
        <div className="p-8">
          {stores.length === 0 ? (
            <p className="text-gray-500">店舗が登録されていません</p>
          ) : (
            <div className="space-y-4">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                >
                  {editingId === store.id ? (
                    <form
                      action={(formData) => handleUpdate(store.id, formData)}
                      className="space-y-4"
                    >
                      <div>
                        <label htmlFor={`name-${store.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                          店舗名 <span className="text-red-500">*</span>
                        </label>
                        <input
                          id={`name-${store.id}`}
                          name="name"
                          type="text"
                          defaultValue={store.name}
                          required
                          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <label htmlFor={`address-${store.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                          住所
                        </label>
                        <input
                          id={`address-${store.id}`}
                          name="address"
                          type="text"
                          defaultValue={store.address || ''}
                          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? '更新中...' : '更新'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null)
                            setError(null)
                          }}
                          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                        >
                          キャンセル
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                        {store.address && (
                          <p className="mt-1 text-sm text-gray-600">{store.address}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          作成日: {new Date(store.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingId(store.id)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                      >
                        編集
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}





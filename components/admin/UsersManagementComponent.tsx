'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createUser, updateUser, deleteUser } from '@/lib/actions/users'
import { assignUserToStore, updateUserStore, getUserStores } from '@/lib/actions/user-stores'
import { formatUserName } from '@/lib/utils/user-name'

interface UsersManagementComponentProps {
  user: {
    id: string
    email?: string
    profile?: {
      name: string
    }
  }
  companyId: number
  users: Array<{
    user_id: string
    is_admin: boolean
    is_active: boolean
    created_at: string
    users: {
      id: string
      last_name: string
      first_name: string
      created_at: string
    }
  }>
  stores: Array<{
    id: number
    name: string
    address?: string
  }>
}

export default function UsersManagementComponent({
  user,
  companyId,
  users: initialUsers,
  stores,
}: UsersManagementComponentProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [storeAssigningId, setStoreAssigningId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userStoresMap, setUserStoresMap] = useState<Record<string, Array<{ store_id: number; is_active: boolean }>>>({})

  // 初期表示時に全ユーザーの店舗情報を読み込む
  useEffect(() => {
    initialUsers.forEach((companyUser) => {
      loadUserStores(companyUser.user_id)
    })
  }, [])

  const loadUserStores = async (userId: string) => {
    const { data } = await getUserStores(userId)
    if (data) {
      setUserStoresMap((prev) => ({
        ...prev,
        [userId]: data.map((us: any) => ({
          store_id: us.store_id,
          is_active: us.is_active,
        })),
      }))
    }
  }

  const handleCreate = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      const name = formData.get('name') as string
      const isAdmin = formData.get('isAdmin') === 'true'

      if (!email || !password || !name) {
        setError('すべての必須項目を入力してください')
        setIsLoading(false)
        return
      }

      const result = await createUser({
        email,
        password,
        name,
        companyId,
        isAdmin,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setIsCreating(false)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'スタッフの作成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (userId: string, formData: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const name = formData.get('name') as string
      const isAdmin = formData.get('isAdmin') === 'true'
      const isActive = formData.get('isActive') === 'true'

      if (!name) {
        setError('名前を入力してください')
        setIsLoading(false)
        return
      }

      const result = await updateUser({
        userId,
        name,
        isAdmin,
        isActive,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setEditingId(null)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'スタッフの更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('このスタッフを削除しますか？')) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await deleteUser(userId)

      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'スタッフの削除に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignStore = async (userId: string, storeId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await assignUserToStore({
        userId,
        storeId,
      })

      if (result.error) {
        setError(result.error)
      } else {
        await loadUserStores(userId)
        setStoreAssigningId(null)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '店舗の割り当てに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStore = async (userId: string, storeId: number, isActive: boolean) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await updateUserStore({
        userId,
        storeId,
        isActive: !isActive,
      })

      if (result.error) {
        setError(result.error)
      } else {
        await loadUserStores(userId)
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
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">スタッフ管理</h1>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
          >
            + スタッフを追加
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
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">新規スタッフ追加</h2>
          </div>
          <form action={handleCreate} className="p-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  名前 <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="isAdmin"
                  name="isAdmin"
                  type="checkbox"
                  value="true"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-700">
                  管理者権限を付与
                </label>
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

      {/* スタッフ一覧 */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
        <div className="border-b border-blue-100 bg-blue-50 px-8 py-7">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">スタッフ一覧</h2>
        </div>
        <div className="p-8">
          {initialUsers.length === 0 ? (
            <p className="text-gray-500">スタッフが登録されていません</p>
          ) : (
            <div className="space-y-6">
              {initialUsers.map((companyUser) => {
                const userStores = userStoresMap[companyUser.user_id] || []
                return (
                  <div
                    key={companyUser.user_id}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    {editingId === companyUser.user_id ? (
                      <form
                        action={(formData) => handleUpdate(companyUser.user_id, formData)}
                        className="space-y-4"
                      >
                        <div>
                          <label htmlFor={`name-${companyUser.user_id}`} className="block text-sm font-medium text-gray-700 mb-2">
                            名前 <span className="text-red-500">*</span>
                          </label>
                          <input
                            id={`name-${companyUser.user_id}`}
                            name="name"
                            type="text"
                            defaultValue={formatUserName(companyUser.users)}
                            required
                            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center">
                            <input
                              id={`isAdmin-${companyUser.user_id}`}
                              name="isAdmin"
                              type="checkbox"
                              value="true"
                              defaultChecked={companyUser.is_admin}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`isAdmin-${companyUser.user_id}`} className="ml-2 block text-sm text-gray-700">
                              管理者
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id={`isActive-${companyUser.user_id}`}
                              name="isActive"
                              type="checkbox"
                              value="true"
                              defaultChecked={companyUser.is_active}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`isActive-${companyUser.user_id}`} className="ml-2 block text-sm text-gray-700">
                              有効
                            </label>
                          </div>
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
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{formatUserName(companyUser.users)}</h3>
                            <p className="mt-1 text-sm text-gray-600">
                              {companyUser.is_admin && (
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 mr-2">
                                  管理者
                                </span>
                              )}
                              {!companyUser.is_active && (
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                  無効
                                </span>
                              )}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              登録日: {new Date(companyUser.created_at).toLocaleDateString('ja-JP')}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingId(companyUser.user_id)}
                              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDelete(companyUser.user_id)}
                              disabled={isLoading}
                              className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-all hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-700">所属店舗</h4>
                            {storeAssigningId !== companyUser.user_id && (
                              <button
                                onClick={() => {
                                  setStoreAssigningId(companyUser.user_id)
                                  loadUserStores(companyUser.user_id)
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700"
                              >
                                + 店舗を追加
                              </button>
                            )}
                          </div>
                          {storeAssigningId === companyUser.user_id && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <select
                                onChange={(e) => {
                                  const storeId = parseInt(e.target.value)
                                  if (storeId) {
                                    handleAssignStore(companyUser.user_id, storeId)
                                  }
                                }}
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              >
                                <option value="">店舗を選択</option>
                                {stores
                                  .filter((store) => !userStores.some((us) => us.store_id === store.id && us.is_active))
                                  .map((store) => (
                                    <option key={store.id} value={store.id}>
                                      {store.name}
                                    </option>
                                  ))}
                              </select>
                              <button
                                onClick={() => setStoreAssigningId(null)}
                                className="mt-2 text-sm text-gray-600 hover:text-gray-700"
                              >
                                キャンセル
                              </button>
                            </div>
                          )}
                          <div className="space-y-2">
                            {userStores.length === 0 && storeAssigningId !== companyUser.user_id && (
                              <p className="text-sm text-gray-500">所属店舗がありません</p>
                            )}
                            {stores
                              .filter((store) => userStores.some((us) => us.store_id === store.id))
                              .map((store) => {
                                const userStore = userStores.find((us) => us.store_id === store.id)
                                return (
                                  <div key={store.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-700">{store.name}</span>
                                    <button
                                      onClick={() => handleToggleStore(companyUser.user_id, store.id, userStore?.is_active || false)}
                                      disabled={isLoading}
                                      className={`text-xs px-2 py-1 rounded ${
                                        userStore?.is_active
                                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                      }`}
                                    >
                                      {userStore?.is_active ? '有効' : '無効'}
                                    </button>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


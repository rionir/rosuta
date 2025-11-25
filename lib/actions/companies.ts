'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateCompanyInput {
  name: string
  stripeCustomerId?: string
  plan?: string
  status?: string
}

export interface UpdateCompanyInput {
  companyId: number
  name?: string
  stripeCustomerId?: string
  plan?: string
  status?: string
}

/**
 * 企業を作成
 */
export async function createCompany(input: CreateCompanyInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('companies')
    .insert({
      name: input.name,
      stripe_customer_id: input.stripeCustomerId,
      plan: input.plan ?? 'free',
      status: input.status ?? 'active',
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/admin/companies')
  return { data }
}

/**
 * 企業情報を更新
 */
export async function updateCompany(input: UpdateCompanyInput) {
  const supabase = await createClient()

  const updates: {
    name?: string
    stripe_customer_id?: string
    plan?: string
    status?: string
  } = {}

  if (input.name) updates.name = input.name
  if (input.stripeCustomerId !== undefined) updates.stripe_customer_id = input.stripeCustomerId
  if (input.plan) updates.plan = input.plan
  if (input.status) updates.status = input.status

  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', input.companyId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/admin/companies')
  return { data }
}

/**
 * 企業一覧を取得
 */
export async function getCompanies() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

/**
 * 企業情報を取得
 */
export async function getCompany(companyId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}


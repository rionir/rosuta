'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupabaseCompanyRepository } from '@/infrastructure/repositories/company/supabase-company-repository'
import { CreateCompanyUseCase } from '@/application/company/use-cases/create-company-use-case'
import { UpdateCompanyUseCase } from '@/application/company/use-cases/update-company-use-case'
import { GetCompaniesUseCase } from '@/application/company/use-cases/get-companies-use-case'
import { GetCompanyUseCase } from '@/application/company/use-cases/get-company-use-case'
import { CreateCompanyDTO } from '@/application/company/dto/create-company-dto'
import { UpdateCompanyDTO } from '@/application/company/dto/update-company-dto'
import { CompanyDTO } from '@/presentation/company/dto/company-dto'
import { ErrorHandler } from '@/presentation/common/error-handler'

// 既存のインターフェースを維持（後方互換性）
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

  const companyRepository = new SupabaseCompanyRepository(supabase)
  const createCompanyUseCase = new CreateCompanyUseCase(companyRepository)

  const dto: CreateCompanyDTO = {
    name: input.name,
    stripeCustomerId: input.stripeCustomerId,
    plan: input.plan,
    status: input.status,
  }

  const result = await createCompanyUseCase.execute(dto)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '企業の作成に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: CompanyDTO = handled.data.toDTO()

  revalidatePath('/app/admin/companies')
  return { data }
}

/**
 * 企業情報を更新
 */
export async function updateCompany(input: UpdateCompanyInput) {
  const supabase = await createClient()

  const companyRepository = new SupabaseCompanyRepository(supabase)
  const updateCompanyUseCase = new UpdateCompanyUseCase(companyRepository)

  const dto: UpdateCompanyDTO = {
    companyId: input.companyId,
    name: input.name,
    stripeCustomerId: input.stripeCustomerId,
    plan: input.plan,
    status: input.status,
  }

  const result = await updateCompanyUseCase.execute(dto)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '企業の更新に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: CompanyDTO = handled.data.toDTO()

  revalidatePath('/app/admin/companies')
  return { data }
}

/**
 * 企業一覧を取得
 */
export async function getCompanies() {
  const supabase = await createClient()

  const companyRepository = new SupabaseCompanyRepository(supabase)
  const getCompaniesUseCase = new GetCompaniesUseCase(companyRepository)

  const result = await getCompaniesUseCase.execute()

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '企業一覧の取得に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: CompanyDTO[] = handled.data.map((company) => company.toDTO())

  return { data }
}

/**
 * 企業情報を取得
 */
export async function getCompany(companyId: number) {
  const supabase = await createClient()

  const companyRepository = new SupabaseCompanyRepository(supabase)
  const getCompanyUseCase = new GetCompanyUseCase(companyRepository)

  const result = await getCompanyUseCase.execute(companyId)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '企業情報の取得に失敗しました' }
  }

  return { data: handled.data.toDTO() }
}


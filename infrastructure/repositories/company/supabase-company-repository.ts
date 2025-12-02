import { SupabaseClient } from '@supabase/supabase-js'
import { Company } from '@/domain/company/entities/company'
import { ICompanyRepository } from '@/domain/company/repositories/company-repository'

/**
 * SupabaseCompanyRepository
 * ICompanyRepositoryのSupabase実装
 */
export class SupabaseCompanyRepository implements ICompanyRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createCompany(company: Company): Promise<Company> {
    const { data, error } = await this.supabase
      .from('companies')
      .insert({
        name: company.name,
        stripe_customer_id: company.stripeCustomerId,
        plan: company.plan,
        status: company.status,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create company: ${error.message}`)
    }

    return new Company(
      data.id,
      data.name,
      data.stripe_customer_id,
      data.plan,
      data.status,
      new Date(data.created_at),
      new Date(data.updated_at)
    )
  }

  async updateCompany(company: Company): Promise<Company> {
    const { error } = await this.supabase
      .from('companies')
      .update({
        name: company.name,
        stripe_customer_id: company.stripeCustomerId,
        plan: company.plan,
        status: company.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', company.id)

    if (error) {
      throw new Error(`Failed to update company: ${error.message}`)
    }

    return company
  }

  async findById(companyId: number): Promise<Company | null> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to find company: ${error.message}`)
    }

    if (!data) {
      return null
    }

    return new Company(
      data.id,
      data.name,
      data.stripe_customer_id,
      data.plan,
      data.status,
      new Date(data.created_at),
      new Date(data.updated_at)
    )
  }

  async findAll(): Promise<Company[]> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to find companies: ${error.message}`)
    }

    return (data || []).map(
      (item: any) =>
        new Company(
          item.id,
          item.name,
          item.stripe_customer_id,
          item.plan,
          item.status,
          new Date(item.created_at),
          new Date(item.updated_at)
        )
    )
  }
}


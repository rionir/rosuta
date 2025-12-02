import { createClient } from '@/lib/supabase/server'

/**
 * SignOutUseCase
 * サインアウトのユースケース
 */
export class SignOutUseCase {
  async execute(): Promise<void> {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
}


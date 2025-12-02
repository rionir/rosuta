import { signOut } from '@/presentation/auth/actions/auth'

export async function POST() {
  await signOut()
}


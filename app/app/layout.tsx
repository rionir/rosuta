import Navigation from "@/components/layout/Navigation";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NavigationWrapper>{children}</NavigationWrapper>;
}

async function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const { getCurrentUser, isUserAdmin } = await import('@/presentation/auth/actions/auth')
  const { headers } = await import('next/headers')
  
  const userResult = await getCurrentUser()
  const user = !('error' in userResult) ? userResult.data : null
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // ログインページではナビゲーションを表示しない
  if (!user || pathname === '/app/login') {
    return (
      <main className="min-h-screen">{children}</main>
    )
  }

  const isAdmin = await isUserAdmin(user.id)

  // 型を合わせるために必要なプロパティのみを抽出
  const navigationUser = {
    id: user.id,
    email: user.email,
    profile: user.profile,
  }

  return (
    <>
      <Navigation user={navigationUser} isAdmin={isAdmin} />
      <main className="min-h-screen">{children}</main>
    </>
  );
}


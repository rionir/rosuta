import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-lg shadow-sm dark:border-gray-700 dark:bg-gray-800/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-sm transition-all group-hover:bg-blue-700 group-hover:shadow-md">
                <span className="text-lg font-bold text-white">ロ</span>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight dark:text-gray-100">
                ロスタ
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/app/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
              >
                ログイン
              </Link>
              <Link
                href="/app/login"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 shadow-sm"
              >
                無料で始める
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-gray-100">
              シンプルで効率的な
              <br />
              <span className="text-blue-600 dark:text-blue-400">勤怠・シフト管理</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
              ロスタは、シンプルで使いやすい勤怠・シフト管理システムです。
              <br />
              打刻、シフト管理、勤務実績の集計を一元化し、効率的な店舗運営をサポートします。
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/app/login"
                className="rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
              >
                無料で始める
              </Link>
              <Link
                href="#features"
                className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100"
              >
                機能を見る <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-100">
              主要機能
            </h2>
            <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-400">
              店舗運営に必要な機能をすべて提供
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <Feature
                icon="clock"
                title="打刻管理"
                description="出勤・退勤・休憩の打刻を簡単に記録。手動打刻や予定時刻からの自動打刻にも対応。"
              />
              <Feature
                icon="shifts"
                title="シフト管理"
                description="シフトの作成・編集・削除を効率的に。日/週/月単位でのコピー機能で作業時間を大幅短縮。"
              />
              <Feature
                icon="calendar"
                title="カレンダー表示"
                description="スタッフや管理者がシフトと打刻記録を一目で確認。色分け表示で状況がすぐにわかります。"
              />
              <Feature
                icon="approval"
                title="打刻承認"
                description="打刻の修正や手動打刻を承認フローで管理。承認待ちの一覧から簡単に承認・却下できます。"
              />
              <Feature
                icon="summary"
                title="勤務実績集計"
                description="日別・週別・月別で勤務時間を集計。予定時間との比較も可能です。"
              />
              <Feature
                icon="store"
                title="複数店舗対応"
                description="1店舗から複数店舗まで対応。店舗ごとの設定やスタッフの所属管理が可能です。"
              />
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16 sm:py-24 dark:bg-blue-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              今すぐ始めましょう
            </h2>
            <p className="mt-6 text-lg leading-8 text-blue-100">
              ロスタで、効率的な店舗運営を実現してください。
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/app/login"
                className="rounded-lg bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-sm transition-all hover:bg-blue-50"
              >
                無料で始める
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
                <span className="text-lg font-bold text-white">ロ</span>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight dark:text-gray-100">
                ロスタ
              </span>
            </Link>
          </div>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            © 2025 ロスタ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  const renderIcon = () => {
    const iconProps = {
      className: 'h-6 w-6 text-blue-600 dark:text-blue-400',
      fill: 'none' as const,
      stroke: 'currentColor' as const,
      viewBox: '0 0 24 24' as const,
      strokeWidth: 2,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
    }

    switch (icon) {
      case 'clock':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        )
      case 'shifts':
        return (
          <svg {...iconProps}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )
      case 'calendar':
        return (
          <svg {...iconProps}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
          </svg>
        )
      case 'store':
        return (
          <svg {...iconProps}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        )
      case 'approval':
        return (
          <svg {...iconProps}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        )
      case 'summary':
        return (
          <svg {...iconProps}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col">
      <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
          {renderIcon()}
        </div>
        {title}
      </dt>
      <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
        <p className="flex-auto">{description}</p>
      </dd>
    </div>
  )
}

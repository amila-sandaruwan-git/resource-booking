import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { getSession } from '@/lib/session'
import LogoutButton from '@/components/LogoutButton'

async function UserInfo() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="flex items-center gap-4">
      {session.role === 'ADMIN' && (
        <Link
          href="/admin"
          className="hidden md:inline text-sm text-gray-700 hover:text-blue-600 transition"
        >
          Admin
        </Link>
      )}
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-sm text-gray-600">
          {session.email}
        </span>
        <LogoutButton />
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white/95 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="font-bold text-lg text-gray-900 flex items-center gap-2"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">
                R
              </span>
              <span className="hidden sm:inline">ResourceHub</span>
            </Link>
            <div className="hidden md:flex items-center gap-5">
              <Link
                href="/resources"
                className="text-sm text-gray-700 hover:text-blue-600 transition"
              >
                Resources
              </Link>
              <Link
                href="/reservations"
                className="text-sm text-gray-700 hover:text-blue-600 transition"
              >
                My Reservations
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Suspense
              fallback={
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              }
            >
              <UserInfo />
            </Suspense>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  )
}
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-gray-600 mt-2">This page doesn&apos;t exist.</p>
        <Link
          href="/dashboard"
          className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
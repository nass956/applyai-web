export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Authentification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            <a href="/auth/signin" className="text-indigo-600 hover:text-indigo-500">
              Cliquez ici pour vous connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 
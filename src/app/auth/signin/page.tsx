"use client"

import SignInButtons from "./SignInButtons"

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Connexion
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choisissez votre méthode de connexion
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <SignInButtons />
          
          <div className="text-xs text-center text-gray-500">
            En vous connectant, vous acceptez nos conditions d'utilisation
          </div>
        </div>
      </div>
    </div>
  )
} 
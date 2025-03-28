"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages = {
    Configuration: "Il y a un problème avec la configuration du serveur.",
    AccessDenied: "Vous n'avez pas la permission de vous connecter.",
    Verification: "Le lien de vérification a expiré ou a déjà été utilisé.",
    Default: "Une erreur est survenue lors de la connexion.",
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Erreur d'authentification
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {error ? errorMessages[error as keyof typeof errorMessages] : errorMessages.Default}
          </p>
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/auth/signin"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Retour à la page de connexion
          </Link>
        </div>
      </div>
    </div>
  )
} 
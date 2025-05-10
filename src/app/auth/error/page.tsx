"use client"

import { useSearchParams } from "next/navigation"

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "Configuration":
        return "Il y a un problème avec la configuration du serveur d'authentification."
      case "AccessDenied":
        return "L'accès a été refusé."
      case "Verification":
        return "Le lien de vérification a expiré ou est invalide."
      default:
        return "Une erreur s'est produite lors de l'authentification."
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Erreur d'authentification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {error ? getErrorMessage(error) : "Une erreur inattendue s'est produite."}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <a
            href="/auth/signin"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Retour à la page de connexion
          </a>
        </div>
      </div>
    </div>
  )
} 
export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Vérifiez votre email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Un lien de connexion a été envoyé à votre adresse email.
            Veuillez vérifier votre boîte de réception et cliquer sur le lien pour vous connecter.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="text-center text-sm text-gray-500">
            Si vous ne recevez pas l'email dans les prochaines minutes, vérifiez votre dossier spam.
          </div>
        </div>
      </div>
    </div>
  )
} 
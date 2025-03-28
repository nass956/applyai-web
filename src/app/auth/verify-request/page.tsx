export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Vérifiez votre email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Un lien de connexion a été envoyé à votre adresse email.
            Veuillez vérifier votre boîte de réception.
          </p>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Si vous ne recevez pas d'email, vérifiez votre dossier spam.
          </p>
        </div>
      </div>
    </div>
  )
} 
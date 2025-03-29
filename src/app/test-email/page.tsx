"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

export default function TestEmailPage() {
  const [email, setEmail] = useState("info.just4work@gmail.com")
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  // Test d'envoi direct via Resend
  const testDirectEmail = async () => {
    setLoading(true)
    setTestResult(null)
    
    try {
      const response = await fetch(`/api/test-email?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({ success: false, message: String(error) })
    } finally {
      setLoading(false)
    }
  }

  // Test d'authentification par email via NextAuth
  const testAuthEmail = async () => {
    setAuthLoading(true)
    setTestResult(null)
    
    try {
      const result = await signIn("email", { 
        email,
        redirect: false 
      })
      
      setTestResult({ 
        success: !result?.error,
        message: result?.error || "Email d'authentification envoyé avec succès",
        data: result
      })
    } catch (error) {
      setTestResult({ success: false, message: String(error) })
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Test d'Authentification par Email</h1>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="votre@email.com"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={testDirectEmail}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Envoi..." : "Tester Email Direct"}
          </button>
          
          <button
            onClick={testAuthEmail}
            disabled={authLoading}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {authLoading ? "Envoi..." : "Tester Authentification"}
          </button>
        </div>
        
        {testResult && (
          <div className={`p-4 mt-4 rounded-md ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h3 className={`text-lg font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {testResult.success ? 'Succès' : 'Erreur'}
            </h3>
            <p className={`mt-2 text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
              {testResult.message}
            </p>
            {testResult.data && (
              <pre className="mt-3 bg-gray-50 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            )}
          </div>
        )}
        
        <div className="mt-8 border-t pt-4">
          <h2 className="text-lg font-semibold mb-3">Navigation :</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/" className="text-indigo-600 hover:text-indigo-500">
                Accueil
              </a>
            </li>
            <li>
              <a href="/auth/signin" className="text-indigo-600 hover:text-indigo-500">
                Page de connexion
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
} 
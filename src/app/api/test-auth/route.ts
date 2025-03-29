import { NextResponse } from 'next/server'

export async function GET() {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.POLE_EMPLOI_CLIENT_ID!,
    client_secret: process.env.POLE_EMPLOI_CLIENT_SECRET!,
    scope: 'api_offresdemploiv2'
  })

  try {
    const response = await fetch(
      'https://entreprise.pole-emploi.fr/connexion/oauth2/access_token?realm=%2Fpartenaire',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      }
    )

    const responseText = await response.text()
    
    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      body: responseText,
      envVars: {
        clientIdPresent: !!process.env.POLE_EMPLOI_CLIENT_ID,
        clientIdLength: process.env.POLE_EMPLOI_CLIENT_ID?.length,
        clientSecretPresent: !!process.env.POLE_EMPLOI_CLIENT_SECRET,
        clientSecretLength: process.env.POLE_EMPLOI_CLIENT_SECRET?.length
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")
  
  if (!email) {
    return NextResponse.json(
      { success: false, message: "Email requis" },
      { status: 400 }
    )
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject: "Test d'envoi d'email",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Test d'envoi d'email réussi !</h2>
          <p>Cet email confirme que la configuration de Resend fonctionne correctement.</p>
          <p>Email envoyé à : ${email}</p>
          <p>Date : ${new Date().toLocaleString()}</p>
        </div>
      `,
    })

    if (error) {
      console.error("Erreur Resend:", error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Email envoyé avec succès",
      data
    })
  } catch (error) {
    console.error("Erreur lors de l'envoi:", error)
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    )
  }
} 
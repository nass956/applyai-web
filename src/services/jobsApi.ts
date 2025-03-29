import { Job, JobsQueryParams } from '@/types/jobs'

const POLE_EMPLOI_AUTH_URL = 'https://entreprise.pole-emploi.fr/connexion/oauth2/access_token?realm=%2Fpartenaire'
const POLE_EMPLOI_API_URL = 'https://api.pole-emploi.io/partenaire/offresdemploi/v2/offres'

async function getAccessToken(): Promise<string> {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.POLE_EMPLOI_CLIENT_ID!,
    client_secret: process.env.POLE_EMPLOI_CLIENT_SECRET!,
    scope: 'api_offresdemploiv2 application_PAR_just4work_54a265ab410eea5132043f49c56632b1caaf0f7cd590a74db2040e3b4be27704 o2dsoffre'
  })

  try {
    console.log('Tentative d\'obtention du token avec les paramètres:', {
      url: POLE_EMPLOI_AUTH_URL,
      clientIdLength: process.env.POLE_EMPLOI_CLIENT_ID?.length,
      clientSecretLength: process.env.POLE_EMPLOI_CLIENT_SECRET?.length,
      scope: params.get('scope')
    })

    const response = await fetch(POLE_EMPLOI_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erreur de réponse:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Token obtenu avec succès:', {
      tokenLength: data.access_token?.length,
      expiresIn: data.expires_in,
      scope: data.scope
    })
    return data.access_token
  } catch (error) {
    console.error('Erreur détaillée:', error)
    throw error
  }
}

export async function fetchJobs(params: JobsQueryParams): Promise<Job[]> {
  try {
    const accessToken = await getAccessToken()
    
    // Paramètres de base requis par l'API
    const searchParams = new URLSearchParams()

    // Format de date attendu par l'API : YYYY-MM-DDTHH:MM:SSZ
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    // Formatage des dates au format ISO-8601
    const formatDateISO = (date: Date) => {
      return date.toISOString().split('.')[0] + 'Z'
    }
    
    searchParams.append('minCreationDate', formatDateISO(thirtyDaysAgo))
    searchParams.append('maxCreationDate', formatDateISO(today))
    searchParams.append('range', '0-14')

    if (params.query) {
      searchParams.append('motsCles', params.query)
    }
    if (params.location) {
      searchParams.append('commune', params.location)
    }
    if (params.page) {
      const range = params.pageSize || 15
      const start = (params.page - 1) * range
      searchParams.set('range', `${start}-${start + range - 1}`)
    }
    
    const url = `${POLE_EMPLOI_API_URL}/search?${searchParams.toString()}`
    
    console.log('Tentative de récupération des offres:', {
      url,
      params: Object.fromEntries(searchParams.entries()),
      headers: {
        'Authorization': 'Bearer [...]',
        'Accept': 'application/json'
      }
    })

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })

    const responseText = await response.text()
    console.log('Réponse brute de l\'API:', responseText)

    if (!response.ok) {
      console.error('Erreur lors de la récupération des offres:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
        headers: Object.fromEntries(response.headers)
      })
      throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`)
    }
    
    const data = JSON.parse(responseText)
    console.log('Données reçues:', {
      totalResults: data.resultats?.length,
      firstResult: data.resultats?.[0]
    })
    
    if (!data.resultats) {
      console.error('Format de réponse inattendu:', data)
      throw new Error('Unexpected response format')
    }
    
    // Transformer les données de Pôle Emploi vers notre format standardisé
    return data.resultats.map((job: any) => {
      // Extraire les compétences et qualités professionnelles
      const competences = [
        ...(job.competences?.map((c: any) => c.libelle) || []),
        ...(job.qualitesProfessionnelles?.map((q: any) => q.libelle) || [])
      ]

      // Créer les tags en combinant secteur d'activité, type de contrat et expérience
      const tags = [
        job.secteurActiviteLibelle,
        job.typeContratLibelle,
        job.experienceLibelle,
        job.dureeTravailLibelleConverti
      ].filter(Boolean)

      return {
        id: job.id,
        title: job.intitule,
        company: job.entreprise?.nom || 'Entreprise confidentielle',
        location: formatLocation(job.lieuTravail),
        type: mapJobType(job.typeContrat),
        description: formatDescription(job),
        salary: formatSalary(job.salaire),
        url: `https://candidat.pole-emploi.fr/offres/recherche/detail/${job.id}`,
        postedAt: job.dateCreation,
        tags
      }
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    throw error
  }
}

function formatLocation(lieuTravail: any): string {
  if (!lieuTravail) return 'Non spécifié'
  return lieuTravail.libelle || `${lieuTravail.commune} (${lieuTravail.departement})`
}

function formatSalary(salaire: any): string | undefined {
  if (!salaire) return undefined
  
  const parts = []
  if (salaire.libelle) parts.push(salaire.libelle)
  if (salaire.complement1) parts.push(salaire.complement1)
  if (salaire.complement2) parts.push(salaire.complement2)
  
  return parts.join(' • ')
}

function formatDescription(job: any): string {
  const sections = []

  // Description principale
  if (job.description) {
    sections.push(job.description)
  }

  // Compétences requises
  if (job.competences?.length > 0) {
    sections.push('\n\nCompétences requises :')
    sections.push(job.competences.map((c: any) => `• ${c.libelle}`).join('\n'))
  }

  // Qualités professionnelles
  if (job.qualitesProfessionnelles?.length > 0) {
    sections.push('\n\nQualités professionnelles :')
    sections.push(job.qualitesProfessionnelles.map((q: any) => `• ${q.libelle}`).join('\n'))
  }

  // Informations complémentaires
  const infos = []
  if (job.dureeTravailLibelle) infos.push(`Horaires : ${job.dureeTravailLibelle}`)
  if (job.deplacementLibelle) infos.push(`Déplacements : ${job.deplacementLibelle}`)
  if (job.experienceLibelle) infos.push(`Expérience requise : ${job.experienceLibelle}`)
  if (job.qualificationLibelle) infos.push(`Qualification : ${job.qualificationLibelle}`)
  
  if (infos.length > 0) {
    sections.push('\n\nInformations complémentaires :')
    sections.push(infos.join('\n'))
  }

  return sections.join('\n')
}

function mapJobType(type: string): Job['type'] {
  const typeMap: Record<string, Job['type']> = {
    'CDI': 'FULL_TIME',
    'CDD': 'CONTRACT',
    'MIS': 'CONTRACT', // Mission intérimaire
    'SAI': 'CONTRACT', // Saisonnier
    'LIB': 'FREELANCE', // Profession libérale
    'STG': 'INTERNSHIP', // Stage
    'APR': 'INTERNSHIP', // Apprentissage
  }
  
  return typeMap[type] || 'FULL_TIME'
} 
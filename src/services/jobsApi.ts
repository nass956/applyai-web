import { Job, JobsQueryParams } from '@/types/jobs'

const POLE_EMPLOI_AUTH_URL = 'https://entreprise.pole-emploi.fr/connexion/oauth2/access_token?realm=%2Fpartenaire'
const POLE_EMPLOI_API_URL = 'https://api.emploi-store.fr/partenaire/offresdemploi/v2/offres/search'

async function getAccessToken(): Promise<string> {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.POLE_EMPLOI_CLIENT_ID!,
    client_secret: process.env.POLE_EMPLOI_CLIENT_SECRET!,
    scope: 'api_offresdemploiv2'
  })

  try {
    console.log('Tentative d\'obtention du token avec les paramètres:', {
      url: POLE_EMPLOI_AUTH_URL,
      clientIdLength: process.env.POLE_EMPLOI_CLIENT_ID?.length,
      clientSecretLength: process.env.POLE_EMPLOI_CLIENT_SECRET?.length,
      scope: 'api_offresdemploiv2'
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
    console.log('Token obtenu avec succès')
    return data.access_token
  } catch (error) {
    console.error('Erreur détaillée:', error)
    throw error
  }
}

export async function fetchJobs(params: JobsQueryParams): Promise<Job[]> {
  try {
    const accessToken = await getAccessToken()
    
    const searchParams = new URLSearchParams({
      // Paramètres par défaut
      range: '0-14',
      sort: '1'
    })

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
    
    const url = `${POLE_EMPLOI_API_URL}?${searchParams.toString()}`
    
    console.log('Tentative de récupération des offres:', {
      url,
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

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erreur lors de la récupération des offres:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('Données reçues:', {
      totalResults: data.resultats?.length,
      firstResult: data.resultats?.[0]
    })
    
    // Transformer les données de Pôle Emploi vers notre format standardisé
    return data.resultats.map((job: any) => ({
      id: job.id,
      title: job.intitule,
      company: job.entreprise?.nom || 'Entreprise confidentielle',
      location: formatLocation(job.lieuTravail),
      type: mapJobType(job.typeContrat),
      description: job.description,
      salary: formatSalary(job.salaire),
      url: `https://candidat.pole-emploi.fr/offres/recherche/detail/${job.id}`,
      postedAt: job.dateCreation,
      tags: [job.secteurActiviteLibelle, ...(job.competences?.map((c: any) => c.libelle) || [])]
    }))
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
  return `${salaire.libelle} - ${salaire.complement || ''}`
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
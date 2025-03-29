import { Job, JobsQueryParams } from '@/types/jobs'

const POLE_EMPLOI_AUTH_URL = 'https://entreprise.pole-emploi.fr/connexion/oauth2/access_token'
const POLE_EMPLOI_API_URL = 'https://api.pole-emploi.io/partenaire/offresdemploi/v2/offres/search'

async function getAccessToken(): Promise<string> {
  const params = new URLSearchParams({
    realm: '/partenaire',
    grant_type: 'client_credentials',
    client_id: process.env.POLE_EMPLOI_CLIENT_ID!,
    client_secret: process.env.POLE_EMPLOI_CLIENT_SECRET!,
    scope: 'api_offresdemploiv2 o2dsoffre'
  })

  try {
    const response = await fetch(POLE_EMPLOI_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    })

    if (!response.ok) {
      throw new Error('Failed to get access token')
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting access token:', error)
    throw error
  }
}

export async function fetchJobs(params: JobsQueryParams): Promise<Job[]> {
  try {
    const accessToken = await getAccessToken()
    
    const searchParams = new URLSearchParams()
    if (params.query) {
      searchParams.append('motsCles', params.query)
    }
    if (params.location) {
      searchParams.append('commune', params.location)
    }
    if (params.page) {
      const range = params.pageSize || 10
      const start = (params.page - 1) * range
      searchParams.append('range', `${start}-${start + range - 1}`)
    }
    
    const url = `${POLE_EMPLOI_API_URL}?${searchParams.toString()}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch jobs')
    }
    
    const data = await response.json()
    
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
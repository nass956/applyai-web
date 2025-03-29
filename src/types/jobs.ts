export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: JobType
  description: string
  salary?: string
  url: string
  postedAt: string
  tags: string[]
}

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP'

export interface JobsApiResponse {
  jobs: Job[]
  total: number
  page: number
  pageSize: number
}

export interface JobsQueryParams {
  query?: string
  location?: string
  type?: JobType
  page?: number
  pageSize?: number
} 
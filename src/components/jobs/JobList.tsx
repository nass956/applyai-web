'use client'

import { useEffect, useState } from 'react'
import { Job, JobsQueryParams } from '@/types/jobs'

interface JobListProps {
  initialParams?: JobsQueryParams
}

export default function JobList({ initialParams = {} }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<JobsQueryParams>(initialParams)

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true)
        setError(null)
        
        const searchParams = new URLSearchParams()
        if (params.query) searchParams.append('query', params.query)
        if (params.location) searchParams.append('location', params.location)
        if (params.type) searchParams.append('type', params.type)
        if (params.page) searchParams.append('page', params.page.toString())
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString())
        
        const response = await fetch(`/api/jobs?${searchParams.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch jobs')
        
        const data = await response.json()
        setJobs(data.jobs)
      } catch (error) {
        setError('Une erreur est survenue lors du chargement des offres')
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [params])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center text-gray-600 p-4">
        Aucune offre d'emploi trouvée
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {job.title}
              </h3>
              <p className="text-gray-600 mt-1">
                {job.company} • {job.location}
              </p>
            </div>
            <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
              {job.type.replace('_', ' ')}
            </span>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-700 line-clamp-2">
              {job.description.replace(/<[^>]*>/g, '')}
            </p>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              {job.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Voir l'offre
            </a>
          </div>
        </div>
      ))}
    </div>
  )
} 
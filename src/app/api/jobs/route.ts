import { NextRequest, NextResponse } from 'next/server'
import { fetchJobs } from '@/services/jobsApi'
import { JobsQueryParams } from '@/types/jobs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    
    const params: JobsQueryParams = {
      query: searchParams.get('query') || undefined,
      location: searchParams.get('location') || undefined,
      type: searchParams.get('type') as JobsQueryParams['type'] || undefined,
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 10
    }
    
    const jobs = await fetchJobs(params)
    
    return NextResponse.json({
      jobs,
      total: jobs.length,
      page: params.page,
      pageSize: params.pageSize
    })
  } catch (error) {
    console.error('Error in /api/jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
} 
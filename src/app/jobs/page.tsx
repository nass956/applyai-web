import JobList from '@/components/jobs/JobList'

export default function JobsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Offres d'emploi
        </h1>
        
        {/* Emplacement futur pour les filtres */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-sm">
            Les filtres de recherche seront bientôt disponibles...
          </p>
        </div>
        
        <JobList />
      </div>
    </div>
  )
} 
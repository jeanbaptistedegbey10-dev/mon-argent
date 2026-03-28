import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">

        <div className="relative mb-8 inline-block">
          <div className="text-[120px] leading-none select-none">💸</div>
          <div className="absolute -top-2 -right-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-sm px-3 py-1 rounded-full border border-red-200 dark:border-red-800">
            404
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Page introuvable
        </h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Cette page n'existe pas ou a été déplacée.
          Vérifiez l'URL ou retournez au tableau de bord.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Home size={16} />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
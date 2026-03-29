import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner,     setShowBanner]     = useState(false)
  const [installed,      setInstalled]      = useState(false)

  useEffect(() => {
    // Vérifier si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      const dismissed = localStorage.getItem('pwa-dismissed')
      const lastDismissed = dismissed ? new Date(dismissed) : null
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      // Réafficher après 1 semaine si dismissed
      if (!lastDismissed || lastDismissed < oneWeekAgo) {
        setTimeout(() => setShowBanner(true), 3000)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setShowBanner(false)
      setInstalled(true)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
      setInstalled(true)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-dismissed', new Date().toISOString())
  }

  if (installed || !showBanner) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">

        {/* Barre bleue en haut */}
        <div className="h-1 bg-blue-600" />

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Smartphone size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                Installer l'application
              </p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                Accédez à vos finances depuis votre écran d'accueil, même sans connexion.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 p-0.5"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Plus tard
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Download size={13} />
              Installer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
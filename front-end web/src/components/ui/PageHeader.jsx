import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PageHeader({ titulo, subtitulo, voltar, children }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {voltar && (
          <button
            onClick={() => navigate(voltar)}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold text-white">{titulo}</h1>
          {subtitulo && <p className="text-gray-400 text-xs">{subtitulo}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}
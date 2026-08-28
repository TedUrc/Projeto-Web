import { useNavigate } from 'react-router-dom'
import { Eye, Map, Navigation, Trash2 } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'

export default function CardProduto({ produto, isAdmin, onDeletar }) {
  const navigate = useNavigate()

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-white font-medium text-sm truncate">{produto.codigo_rastreio}</span>
          <StatusBadge status={produto.status} />
        </div>
        <p className="text-gray-400 text-xs truncate">{produto.destinatario}</p>
        <p className="text-gray-500 text-xs truncate">{produto.endereco}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => navigate(`/historico/${produto.id}`)}
          className="text-gray-400 hover:text-blue-400 transition-colors p-1"
          title="Ver histórico"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => navigate(`/mapa/${produto.id}`)}
          className="text-gray-400 hover:text-green-400 transition-colors p-1"
          title="Ver mapa"
        >
          <Map size={16} />
        </button>
        <button
          onClick={() => navigate(`/rastreio/${produto.id}`)}
          className="text-gray-400 hover:text-purple-400 transition-colors p-1"
          title="Rastreio"
        >
          <Navigation size={16} />
        </button>
        {isAdmin && (
          <button
            onClick={() => onDeletar(produto.id)}
            className="text-gray-400 hover:text-red-400 transition-colors p-1"
            title="Deletar"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
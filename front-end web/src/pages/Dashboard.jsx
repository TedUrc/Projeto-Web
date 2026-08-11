import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Truck, CheckCircle, XCircle, Clock, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStats } from '../hooks/produto/useStats'
import GaugeDashboard from '../components/ui/GaugeDashboard'

const CORES_CARD = {
  blue:   'border-blue-800 text-blue-400',
  yellow: 'border-yellow-800 text-yellow-400',
  purple: 'border-purple-800 text-purple-400',
  green:  'border-green-800 text-green-400',
  red:    'border-red-800 text-red-400',
}

export default function Dashboard() {
  const [hovered, setHovered] = useState(null)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { stats, carregando } = useStats()

  const cards = [
    { key: 'total',        label: 'Total',      valor: stats.total,        icon: Package,     cor: 'blue'   },
    { key: 'pendencia',    label: 'Pendência',  valor: stats.pendencia,    icon: Clock,       cor: 'yellow' },
    { key: 'saida',        label: 'Em saída',   valor: stats.saida,        icon: Truck,       cor: 'purple' },
    { key: 'entrega',      label: 'Entregues',  valor: stats.entrega,      icon: CheckCircle, cor: 'green'  },
    { key: 'cancelamento', label: 'Cancelados', valor: stats.cancelamento, icon: XCircil,     cor: 'red'    },
  ]

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Package size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 text-xs">Visão geral do sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/perfil')} className="text-gray-400 hover:text-white transition-colors p-2">
            <User size={18} />
          </button>
          <button onClick={logout} className="text-gray-400 hover:text-white transition-colors p-2">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {carregando ? (
        <div className="text-gray-400 text-sm">Carregando...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((card) => {
              const Icon = card.icon
              const isHov = hovered === card.key
              const isDim = hovered && hovered !== card.key && card.key !== 'total'
              const isTotal = card.key === 'total'
              return (
                <div
                  key={card.key}
                  onMouseEnter={() => !isTotal && setHovered(card.key)}
                  onMouseLeave={() => !isTotal && setHovered(null)}
                  style={{
                    transform: isHov ? 'translateY(-6px)' : 'translateY(0)',
                    opacity: isDim ? 0.3 : 1,
                    transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s',
                  }}
                  className={`border rounded-2xl p-4 bg-gray-900/50 ${CORES_CARD[card.cor]}`}
                >
                  <Icon size={20} className="mb-3" />
                  <div className="text-2xl font-bold text-white">{card.valor}</div>
                  <div className="text-xs mt-1 opacity-70">{card.label}</div>
                </div>
              )
            })}
          </div>

          <GaugeDashboard stats={stats} hovered={hovered} setHovered={setHovered} />

          <div className="mt-6">
            <button
              onClick={() => navigate('/produtos')}
              className="bg-gray-900 border border-gray-800 hover:border-blue-700 rounded-2xl p-6 text-left transition-colors w-full"
            >
              <Package size={24} className="text-blue-400 mb-3" />
              <div className="text-white font-medium">Gerenciar Produtos</div>
              <div className="text-gray-400 text-sm mt-1">Criar, editar e acompanhar produtos</div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
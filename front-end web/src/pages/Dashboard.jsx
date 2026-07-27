import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Truck, CheckCircle, XCircle, Clock, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const GAUGE_DATA = [
  { key: 'pendencia', label: 'Pendência', cor: '#EF9F27' },
  { key: 'saida', label: 'Em saída',  cor: '#9080dd' },
  { key: 'entrega', label: 'Entregues', cor: '#639922' },
  { key: 'cancelamento', label: 'Cancelados', cor: '#E24B4A' },
]

const CORES_CARD = {
  blue: 'border-blue-800 text-blue-400',
  yellow: 'border-yellow-800 text-yellow-400',
  purple: 'border-purple-800 text-purple-400',
  green: 'border-green-800 text-green-400',
  red: 'border-red-800 text-red-400',
}

function polarToCart(cx, cy, r, angle) {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
}

function makeArc(cx, cy, outerR, innerR, startA, endA) {
  const [ox1, oy1] = polarToCart(cx, cy, outerR, startA)
  const [ox2, oy2] = polarToCart(cx, cy, outerR, endA)
  const [ix1, iy1] = polarToCart(cx, cy, innerR, endA)
  const [ix2, iy2] = polarToCart(cx, cy, innerR, startA)
  const large = endA - startA > Math.PI ? 1 : 0
  return `M ${ox1} ${oy1} A ${outerR} ${outerR} 0 ${large} 1 ${ox2} ${oy2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`
}

function Gauge({ stats, hovered, setHovered }) {
  const cx = 130, cy = 145, outerR = 125, innerR = 78
  const total = (stats.pendencia + stats.saida + stats.entrega + stats.cancelamento) || 1
  let currentAngle = Math.PI

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <svg width="320" height="190" viewBox="0 0 260 155" overflow="visible">
        {GAUGE_DATA.map(d => {
          const sweep = (stats[d.key] / total) * Math.PI
          const endA = currentAngle + sweep
          const path = makeArc(cx, cy, outerR, innerR, currentAngle + 0.015, endA - 0.015)
          currentAngle = endA
          const isHov = hovered === d.key
          const isDim = hovered && hovered !== d.key
          return (
            <path
              key={d.key}
              d={path}
              fill={d.cor}
              opacity={isDim ? 0.2 : 1}
              transform={isHov ? 'translate(0,-6)' : ''}
              style={{ transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', cursor: 'default' }}
              onMouseEnter={() => setHovered(d.key)}
              onMouseLeave={() => setHovered(null)}
            />
          )
        })}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="28" fontWeight="500" fill="white">
          {stats.total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="12" fill="#9CA3AF">
          Produtos
        </text>
      </svg>

      <div className="flex flex-col gap-3">
        {GAUGE_DATA.map(d => {
          const isHov = hovered === d.key
          const isDim = hovered && hovered !== d.key
          return (
            <div
              key={d.key}
              onMouseEnter={() => setHovered(d.key)}
              onMouseLeave={() => setHovered(null)}
              style={{ opacity: isDim ? 0.3 : 1, transition: 'opacity 0.2s' }}
              className="flex items-center gap-2 text-sm cursor-default"
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.cor, flexShrink: 0 }} />
              <span className="text-gray-400">{d.label}:</span>
              <span className="text-white font-medium">{stats[d.key]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, pendencia: 0, saida: 0, entrega: 0, cancelamento: 0 })
  const [carregando, setCarregando] = useState(true)
  const [hovered, setHovered] = useState(null)
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function carregarStats() {
      try {
        const response = await api.get('/produtos/')
        const produtos = response.data
        setStats({
          total: produtos.length,
          pendencia: produtos.filter(p => p.status === 'pendência').length,
          saida: produtos.filter(p => p.status === 'saída').length,
          entrega: produtos.filter(p => p.status === 'entrega').length,
          cancelamento: produtos.filter(p => p.status === 'cancelamento').length,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setCarregando(false)
      }
    }
    carregarStats()
  }, [])

  const cards = [
    { key: 'total', label: 'Total', valor: stats.total, icon: Package,cor: 'blue'},
    { key: 'pendencia', label: 'Pendência', valor: stats.pendencia, icon: Clock, cor: 'yellow'},
    { key: 'saida', label: 'Em saída', valor: stats.saida, icon: Truck, cor: 'purple'},
    { key: 'entrega', label: 'Entregues', valor: stats.entrega, icon: CheckCircle, cor: 'green'},
    { key: 'cancelamento', label: 'Cancelados', valor: stats.cancelamento, icon: XCircle, cor: 'red'},
  ]

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">

      {/* Header */}
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
          <button
            onClick={() => navigate('/produtos')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Produtos
          </button>
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
          {/* Cards */}
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
                    cursor: isTotal ? 'default' : 'default'
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

          {/* Gauge */}
          <Gauge stats={stats} hovered={hovered} setHovered={setHovered} />

          {/* Atalho */}
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
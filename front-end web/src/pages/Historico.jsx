import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, CheckCircle, Truck, XCircle, Package } from 'lucide-react'
import api from '../services/api'

const STATUS_CONFIG = {
  'pendência': { icon: Clock, cor: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-800' },
  'saída': { icon: Truck, cor: 'text-purple-400', bg: 'bg-purple-900/30 border-purple-800' },
  'entrega': { icon: CheckCircle, cor: 'text-green-400', bg: 'bg-green-900/30 border-green-800' },
  'cancelamento': { icon: XCircle, cor: 'text-red-400', bg: 'bg-red-900/30 border-red-800' },
}

const STATUS_VALIDOS = ['pendência', 'saída', 'entrega', 'cancelamento']

export default function Historico() {
  const { produtoId } = useParams()
  const navigate = useNavigate()
  const [produto, setProduto] = useState(null)
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [novoStatus, setNovoStatus] = useState('')
  const [atualizando, setAtualizando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregarDados()
  }, [produtoId])

  async function carregarDados() {
    try {
      const [produtoRes, historicoRes] = await Promise.all([
        api.get(`/produtos/${produtoId}`),
        api.get(`/historico/${produtoId}`)
      ])
      setProduto(produtoRes.data)
      setHistorico(historicoRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setCarregando(false)
    }
  }

  async function atualizarStatus(e) {
    e.preventDefault()
    if (!novoStatus) return
    setErro('')
    setAtualizando(true)
    try {
      await api.post(`/historico/${produtoId}/status?status=${encodeURIComponent(novoStatus)}`)
      setNovoStatus('')
      carregarDados()
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao atualizar status')
    } finally {
      setAtualizando(false)
    }
  }

  function formatarData(dataStr) {
    return new Date(dataStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/produtos')}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Histórico</h1>
          <p className="text-gray-400 text-xs">{produto?.codigo_rastreio}</p>
        </div>
      </div>

      {/* Card do produto */}
      {produto && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Package size={16} className="text-blue-400 shrink-0" />
                <span className="text-white font-medium text-sm truncate">
                  {produto.codigo_rastreio}
                </span>
                {STATUS_CONFIG[produto.status] && (
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_CONFIG[produto.status].bg} ${STATUS_CONFIG[produto.status].cor}`}>
                    {produto.status}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm">{produto.destinatario}</p>
              <p className="text-gray-500 text-xs mt-1">{produto.endereco}</p>
            </div>
          </div>
        </div>
      )}

      {/* Atualizar status */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
        <h2 className="text-white font-medium text-sm mb-3">Atualizar Status</h2>
        <form onSubmit={atualizarStatus} className="flex gap-3">
          <select
            value={novoStatus}
            onChange={(e) => setNovoStatus(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">Selecione o status</option>
            {STATUS_VALIDOS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!novoStatus || atualizando}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0"
          >
            {atualizando ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
        {erro && (
          <div className="mt-3 bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm">
            {erro}
          </div>
        )}
      </div>

      {/* Timeline do histórico */}
      <h2 className="text-white font-medium text-sm mb-4">Movimentações</h2>
      {historico.length === 0 ? (
        <div className="text-center py-10">
          <Clock size={32} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhuma movimentação registrada</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-800" />
          <div className="flex flex-col gap-4">
            {historico.map((item, idx) => {
              const config = STATUS_CONFIG[item.status] || {
                icon: Clock,
                cor: 'text-gray-400',
                bg: 'bg-gray-800 border-gray-700'
              }
              const Icon = config.icon
              return (
                <div key={item.id} className="flex gap-4 relative">
                  <div className={`shrink-0 w-10 h-10 rounded-full border flex items-center justify-center z-10 ${config.bg}`}>
                    <Icon size={16} className={config.cor} />
                  </div>
                  <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-3 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${config.cor}`}>
                        {item.status}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {formatarData(item.alterado_em)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
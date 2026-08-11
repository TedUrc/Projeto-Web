import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Plus, Search, Trash2, Eye, Map, Navigation } from 'lucide-react'
import { useProdutos } from '../hooks/produto/useProdutos'
import { useUsuario } from '../hooks/auth/useUsuario'
import { useMotoristas } from '../hooks/auth/useMotoristas'
import StatusBadge from '../components/ui/StatusBadge'
import ErroBox from '../components/ui/ErroBox'
import PageHeader from '../components/ui/PageHeader'

export default function Produtos() {
  const navigate = useNavigate()
  const { produtos, carregando, erro, deletarProduto, criarProduto } = useProdutos()
  const { isAdmin } = useUsuario()
  const { motoristas } = useMotoristas(isAdmin)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState({ codigo_rastreio: '', destinatario: '', endereco: '', motorista_id: '' })
  const [erroCriar, setErroCriar] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleCriar(e) {
    e.preventDefault()
    setErroCriar('')
    setSalvando(true)
    try {
      await criarProduto(form)
      setModalAberto(false)
      setForm({ codigo_rastreio: '', destinatario: '', endereco: '', motorista_id: '' })
    } catch (err) {
      setErroCriar(err.response?.data?.detail || 'Erro ao criar produto')
    } finally {
      setSalvando(false)
    }
  }

  const produtosFiltrados = produtos.filter(p =>
    p.codigo_rastreio.toLowerCase().includes(busca.toLowerCase()) ||
    p.destinatario.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <PageHeader titulo="Produtos">
        {isAdmin && (
          <button
            onClick={() => setModalAberto(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Novo Produto</span>
            <span className="sm:hidden">Novo</span>
          </button>
        )}
      </PageHeader>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por código ou destinatário..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <ErroBox mensagem={erro} />

      {carregando ? (
        <div className="text-gray-400 text-sm">Carregando...</div>
      ) : produtosFiltrados.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {isAdmin ? 'Nenhum produto encontrado' : 'Nenhum produto atribuído a você'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {produtosFiltrados.map((produto) => (
            <div key={produto.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-white font-medium text-sm truncate">{produto.codigo_rastreio}</span>
                  <StatusBadge status={produto.status} />
                </div>
                <p className="text-gray-400 text-xs truncate">{produto.destinatario}</p>
                <p className="text-gray-500 text-xs truncate">{produto.endereco}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => navigate(`/historico/${produto.id}`)} className="text-gray-400 hover:text-blue-400 transition-colors p-1" title="Ver histórico">
                  <Eye size={16} />
                </button>
                <button onClick={() => navigate(`/mapa/${produto.id}`)} className="text-gray-400 hover:text-green-400 transition-colors p-1" title="Ver mapa">
                  <Map size={16} />
                </button>
                <button onClick={() => navigate(`/rastreio/${produto.id}`)} className="text-gray-400 hover:text-purple-400 transition-colors p-1" title="Rastreio">
                  <Navigation size={16} />
                </button>
                {isAdmin && (
                  <button onClick={() => deletarProduto(produto.id)} className="text-gray-400 hover:text-red-400 transition-colors p-1" title="Deletar">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAberto && isAdmin && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white font-bold mb-4">Novo Produto</h2>
            <form onSubmit={handleCriar} className="flex flex-col gap-4">
              {['codigo_rastreio', 'destinatario', 'endereco'].map((campo) => (
                <div key={campo} className="flex flex-col gap-1">
                  <label className="text-sm text-gray-400 capitalize">{campo.replace('_', ' ')}</label>
                  <input
                    type="text"
                    value={form[campo]}
                    onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
                    required
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              ))}

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Atribuir motorista (opcional)</label>
                <select
                  value={form.motorista_id}
                  onChange={(e) => setForm({ ...form, motorista_id: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Sem motorista</option>
                  {motoristas.map(m => (
                    <option key={m.id} value={m.id}>{m.nome} — {m.email}</option>
                  ))}
                </select>
              </div>

              <ErroBox mensagem={erroCriar} />

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setModalAberto(false); setErroCriar('') }} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-lg text-sm transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white py-3 rounded-lg text-sm font-medium transition-colors">
                  {salvando ? 'Salvando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
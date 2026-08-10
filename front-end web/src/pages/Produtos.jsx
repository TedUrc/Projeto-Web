import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Plus, Search, ArrowLeft, Trash2, Eye, Map, Navigation } from 'lucide-react'
import api from '../services/api'

const STATUS_CORES = {
  'pendência': 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
  'saída': 'bg-purple-900/30 text-purple-400 border-purple-800',
  'entrega': 'bg-green-900/30 text-green-400 border-green-800',
  'cancelamento': 'bg-red-900/30 text-red-400 border-red-800',
}

export default function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState({ codigo_rastreio: '', destinatario: '', endereco: '', motorista_id: '' })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [usuario, setUsuario] = useState(null)
  const [motoristas, setMotoristas] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    async function init() {
      try {
        const meRes = await api.get('/auth/me')
        setUsuario(meRes.data)

        if (meRes.data.role === 'admin') {
          const usuariosRes = await api.get('/auth/usuarios')
          setMotoristas(usuariosRes.data.filter(u => u.role === 'motorista'))
        }
      } catch (err) {
        console.error(err)
      }
      await carregarProdutos()
    }
    init()
  }, [])

  async function carregarProdutos() {
    try {
      const response = await api.get('/produtos/')
      setProdutos(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setCarregando(false)
    }
  }

  async function criarProduto(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      await api.post('/produtos/', {
        ...form,
        motorista_id: form.motorista_id ? parseInt(form.motorista_id) : null
      })
      setModalAberto(false)
      setForm({ codigo_rastreio: '', destinatario: '', endereco: '', motorista_id: '' })
      carregarProdutos()
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao criar produto')
    } finally {
      setSalvando(false)
    }
  }

  async function deletarProduto(id) {
    if (!confirm('Deseja deletar este produto?')) return
    try {
      await api.delete(`/produtos/${id}`)
      carregarProdutos()
    } catch (err) {
      console.error(err)
    }
  }

  const isAdmin = usuario?.role === 'admin'

  const produtosFiltrados = produtos.filter(p =>
    p.codigo_rastreio.toLowerCase().includes(busca.toLowerCase()) ||
    p.destinatario.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package size={20} className="text-blue-400" />
          <h1 className="text-lg font-bold text-white">Produtos</h1>
        </div>
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
      </div>

      {/* Busca */}
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

      {/* Lista */}
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
            <div
              key={produto.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-white font-medium text-sm truncate">
                    {produto.codigo_rastreio}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_CORES[produto.status] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                    {produto.status}
                  </span>
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
                    onClick={() => deletarProduto(produto.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors p-1"
                    title="Deletar"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal criar produto — só admin */}
      {modalAberto && isAdmin && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white font-bold mb-4">Novo Produto</h2>
            <form onSubmit={criarProduto} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Código de Rastreio</label>
                <input
                  type="text"
                  value={form.codigo_rastreio}
                  onChange={(e) => setForm({ ...form, codigo_rastreio: e.target.value })}
                  placeholder="BR123456789BR"
                  required
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Destinatário</label>
                <input
                  type="text"
                  value={form.destinatario}
                  onChange={(e) => setForm({ ...form, destinatario: e.target.value })}
                  placeholder="Nome completo"
                  required
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Endereço</label>
                <input
                  type="text"
                  value={form.endereco}
                  onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  placeholder="Rua, número, cidade"
                  required
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

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

              {erro && (
                <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {erro}
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setModalAberto(false); setErro('') }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white py-3 rounded-lg text-sm font-medium transition-colors"
                >
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
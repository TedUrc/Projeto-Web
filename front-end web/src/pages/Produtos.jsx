import { useState } from 'react'
import { Plus, Search, Package } from 'lucide-react'
import { useProdutos } from '../hooks/produto/useProdutos'
import { useUsuario } from '../hooks/auth/useUsuario'
import { useMotoristas } from '../hooks/auth/useMotoristas'
import CardProduto from '../components/produto/CardProduto'
import ModalCriarProduto from '../components/produto/ModalCriarProduto'
import PageHeader from '../components/ui/PageHeader'

export default function Produtos() {
  const { produtos, carregando, deletarProduto, criarProduto } = useProdutos()
  const { isAdmin } = useUsuario()
  const { motoristas } = useMotoristas(isAdmin)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)

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
          {produtosFiltrados.map(produto => (
            <CardProduto
              key={produto.id}
              produto={produto}
              isAdmin={isAdmin}
              onDeletar={deletarProduto}
            />
          ))}
        </div>
      )}

      {modalAberto && isAdmin && (
        <ModalCriarProduto
          motoristas={motoristas}
          onCriar={criarProduto}
          onFechar={() => setModalAberto(false)}
        />
      )}
    </div>
  )
}
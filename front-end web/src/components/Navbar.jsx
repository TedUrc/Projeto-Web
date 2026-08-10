import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Users, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario } = useAuth()

  const isAdmin = usuario?.role === 'admin'

  const itens = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Início' },
    { path: '/produtos',  icon: Package,         label: 'Produtos' },
    ...(isAdmin ? [{ path: '/usuarios', icon: Users, label: 'Usuários' }] : []),
    { path: '/perfil',    icon: User,            label: 'Perfil' },
  ]

  const ativo = (path) => location.pathname === path

  return (
    <>
      {/* Mobile — barra inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex md:hidden z-50">
        {itens.map(({ path, icon: Icon, label }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
              ativo(path) ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </nav>

      {/* Desktop — barra lateral */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-gray-900 border-r border-gray-800 flex-col p-4 z-50">
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 mb-8 px-2 cursor-pointer"
        >
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Package size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm">Logística</span>
        </div>

        <div className="flex flex-col gap-1">
          {itens.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                ativo(path)
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-800/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
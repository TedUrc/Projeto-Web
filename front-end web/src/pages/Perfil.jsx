import { useNavigate } from 'react-router-dom'
import { User, Mail, Shield, LogOut, Edit } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useUsuario } from '../hooks/auth/useUsuario'
import LoadingScreen from '../components/ui/LoadingScreen'
import PageHeader from '../components/ui/PageHeader'

function InfoItem({ icon: Icon, label, valor, corValor = 'text-white' }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
      <div className="bg-gray-700 p-2.5 rounded-lg shrink-0">
        <Icon size={18} className="text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-400 text-xs mb-0.5">{label}</p>
        <p className={`text-sm font-medium truncate ${corValor}`}>{valor}</p>
      </div>
    </div>
  )
}

export default function Perfil() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { usuario, carregando } = useUsuario()

  if (carregando) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <PageHeader titulo="Meu Perfil" subtitulo="Informações da sua conta" />

      {usuario ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">

          {/* Card principal */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="bg-blue-600 p-6 rounded-full">
                  <User size={40} className="text-white" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${usuario.ativo ? 'bg-green-400' : 'bg-red-400'}`} />
              </div>
              <h2 className="text-white font-bold text-xl mb-1">{usuario.nome}</h2>
              <p className="text-gray-400 text-sm mb-3">{usuario.email}</p>
              <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${
                usuario.role === 'admin'
                  ? 'bg-yellow-900/30 border-yellow-800 text-yellow-400'
                  : 'bg-blue-900/30 border-blue-800 text-blue-400'
              }`}>
                {usuario.role === 'admin' ? '👑 Administrador' : '🚗 Motorista'}
              </span>
            </div>
          </div>

          {/* Informações detalhadas */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Shield size={16} className="text-blue-400" />
                Informações da conta
              </h3>
              <div className="flex flex-col gap-3">
                <InfoItem icon={Mail}   label="Email"            valor={usuario.email} />
                <InfoItem icon={User}   label="Nome completo"    valor={usuario.nome} />
                <InfoItem
                  icon={Shield}
                  label="Status da conta"
                  valor={usuario.ativo ? '● Ativa' : '● Inativa'}
                  corValor={usuario.ativo ? 'text-green-400' : 'text-red-400'}
                />
                <InfoItem
                  icon={Shield}
                  label="Nível de acesso"
                  valor={usuario.role === 'admin' ? 'Administrador' : 'Motorista'}
                  corValor={usuario.role === 'admin' ? 'text-yellow-400' : 'text-blue-400'}
                />
              </div>
            </div>

            {/* Ações */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Ações</h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { logout(); navigate('/login') }}
                  className="flex items-center gap-3 w-full bg-red-900/20 hover:bg-red-900/40 border border-red-800/50 text-red-400 py-3 px-4 rounded-xl text-sm font-medium transition-colors"
                >
                  <LogOut size={16} />
                  Sair da conta
                </button>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="text-gray-400 text-sm">Erro ao carregar perfil</div>
      )}
    </div>
  )
}
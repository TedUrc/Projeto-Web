import { useNavigate } from 'react-router-dom'
import { User, Mail, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useUsuario } from '../hooks/auth/useUsuario'
import LoadingScreen from '../components/ui/LoadingScreen'
import PageHeader from '../components/ui/PageHeader'

function InfoItem({ icon: Icon, label, valor, corValor = 'text-white' }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
      <Icon size={16} className="text-blue-400 shrink-0" />
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p className={`text-sm ${corValor}`}>{valor}</p>
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
      <PageHeader titulo="Meu Perfil" voltar="/dashboard" />

      {usuario ? (
        <div className="flex flex-col gap-4 max-w-md">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center">
            <div className="bg-blue-600 p-4 rounded-full mb-4">
              <User size={32} className="text-white" />
            </div>
            <h2 className="text-white font-bold text-lg">{usuario.nome}</h2>
            <p className="text-gray-400 text-sm mt-1">{usuario.email}</p>
            <span className={`mt-2 text-xs px-3 py-1 rounded-full border ${
              usuario.role === 'admin'
                ? 'bg-yellow-900/30 border-yellow-800 text-yellow-400'
                : 'bg-blue-900/30 border-blue-800 text-blue-400'
            }`}>
              {usuario.role}
            </span>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-3">
            <InfoItem icon={Mail} label="Email" valor={usuario.email} />
            <InfoItem icon={User} label="Nome" valor={usuario.nome} />
            <InfoItem
              icon={Shield}
              label="Status da conta"
              valor={usuario.ativo ? 'Ativa' : 'Inativa'}
              corValor={usuario.ativo ? 'text-green-400' : 'text-red-400'}
            />
          </div>

          <button
            onClick={() => { logout(); navigate('/login') }}
            className="bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-400 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            Sair da conta
          </button>
        </div>
      ) : (
        <div className="text-gray-400 text-sm">Erro ao carregar perfil</div>
      )}
    </div>
  )
}
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Perfil() {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const response = await api.get('/auth/me')
        setUsuario(response.data)
      } catch (err) {
        console.error(err)
      } finally {
        setCarregando(false)
      }
    }
    carregarPerfil()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-white">Meu Perfil</h1>
      </div>

      {carregando ? (
        <div className="text-gray-400 text-sm">Carregando...</div>
      ) : usuario ? (
        <div className="flex flex-col gap-4 max-w-md">

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center">
            <div className="bg-blue-600 p-4 rounded-full mb-4">
              <User size={32} className="text-white" />
            </div>
            <h2 className="text-white font-bold text-lg">{usuario.nome}</h2>
            <p className="text-gray-400 text-sm mt-1">{usuario.email}</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
              <Mail size={16} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-gray-400 text-xs">Email</p>
                <p className="text-white text-sm">{usuario.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
              <User size={16} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-gray-400 text-xs">Nome</p>
                <p className="text-white text-sm">{usuario.nome}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
              <Shield size={16} className="text-green-400 shrink-0" />
              <div>
                <p className="text-gray-400 text-xs">Status da conta</p>
                <p className="text-green-400 text-sm">{usuario.ativo ? 'Ativa' : 'Inativa'}</p>
              </div>
            </div>
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
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, User, Mail, Shield } from 'lucide-react'
import api from '../services/api'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [semPermissao, setSemPermissao] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const response = await api.get('/auth/usuarios')
        setUsuarios(response.data)
      } catch (err) {
        if (err.response?.status === 403) {
          setSemPermissao(true)
        }
        console.error(err)
      } finally {
        setCarregando(false)
      }
    }
    carregarUsuarios()
  }, [])

  if (semPermissao) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Shield size={40} className="text-red-400 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">Acesso negado</p>
          <p className="text-gray-400 text-sm mb-6">Apenas administradores podem ver essa página</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Users size={20} className="text-blue-400" />
          <h1 className="text-lg font-bold text-white">Usuários</h1>
        </div>
      </div>

      {carregando ? (
        <div className="text-gray-400 text-sm">Carregando...</div>
      ) : usuarios.length === 0 ? (
        <div className="text-center py-16">
          <Users size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-md">
          {usuarios.map((usuario) => (
            <div
              key={usuario.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="bg-blue-900/30 border border-blue-800 p-3 rounded-full shrink-0">
                <User size={18} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium text-sm truncate">{usuario.nome}</p>
                  {usuario.role === 'admin' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-900/30 border border-yellow-800 text-yellow-400 shrink-0">
                      admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Mail size={11} className="text-gray-500 shrink-0" />
                  <p className="text-gray-400 text-xs truncate">{usuario.email}</p>
                </div>
              </div>
              <div className={`shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${usuario.ativo ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-red-900/30 border-red-800 text-red-400'}`}>
                <Shield size={10} />
                {usuario.ativo ? 'Ativo' : 'Inativo'}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
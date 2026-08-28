import { useState, useEffect } from 'react'
import { User, Mail, Shield, Users, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import api from '../services/api'
import LoadingScreen from '../components/ui/LoadingScreen'
import PageHeader from '../components/ui/PageHeader'

function ModalConfirmacao({ titulo, mensagem, onConfirmar, onCancelar, corBotao = 'bg-red-600 hover:bg-red-500' }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-white font-bold mb-2">{titulo}</h2>
        <p className="text-gray-400 text-sm mb-6">{mensagem}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-lg text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className={`flex-1 ${corBotao} text-white py-3 rounded-lg text-sm font-medium transition-colors`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [semPermissao, setSemPermissao] = useState(false)
  const [modalDeletar, setModalDeletar] = useState(null)
  const [modalToggle, setModalToggle] = useState(null)

  async function carregar() {
    try {
      const res = await api.get('/auth/usuarios')
      setUsuarios(res.data)
    } catch (err) {
      if (err.response?.status === 403) setSemPermissao(true)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function handleDeletar(id) {
    try {
      await api.delete(`/auth/usuarios/${id}`)
      setModalDeletar(null)
      carregar()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao deletar usuário')
    }
  }

  async function handleToggle(id) {
    try {
      await api.patch(`/auth/usuarios/${id}/ativar`)
      setModalToggle(null)
      carregar()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao alterar status')
    }
  }

  if (carregando) return <LoadingScreen />

  if (semPermissao) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Shield size={40} className="text-red-400 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">Acesso negado</p>
          <p className="text-gray-400 text-sm">Apenas administradores podem ver essa página</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <PageHeader titulo="Usuários" subtitulo={`${usuarios.length} cadastrados`} />

      {usuarios.length === 0 ? (
        <div className="text-center py-16">
          <Users size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-lg">
          {usuarios.map((usuario) => (
            <div key={usuario.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
              <div className={`p-3 rounded-full shrink-0 border ${usuario.ativo ? 'bg-blue-900/30 border-blue-800' : 'bg-gray-800 border-gray-700'}`}>
                <User size={18} className={usuario.ativo ? 'text-blue-400' : 'text-gray-500'} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-medium text-sm truncate">{usuario.nome}</p>
                  {usuario.role === 'admin' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-900/30 border border-yellow-800 text-yellow-400 shrink-0">
                      admin
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${
                    usuario.ativo
                      ? 'bg-green-900/30 border-green-800 text-green-400'
                      : 'bg-red-900/30 border-red-800 text-red-400'
                  }`}>
                    {usuario.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Mail size={11} className="text-gray-500 shrink-0" />
                  <p className="text-gray-400 text-xs truncate">{usuario.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setModalToggle(usuario)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    usuario.ativo
                      ? 'text-green-400 hover:bg-green-900/30'
                      : 'text-gray-500 hover:bg-gray-800'
                  }`}
                  title={usuario.ativo ? 'Desativar conta' : 'Ativar conta'}
                >
                  {usuario.ativo ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
                <button
                  onClick={() => setModalDeletar(usuario)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                  title="Deletar conta"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalDeletar && (
        <ModalConfirmacao
          titulo="Deletar usuário"
          mensagem={`Tem certeza que deseja deletar a conta de "${modalDeletar.nome}"? Esta ação é irreversível.`}
          onConfirmar={() => handleDeletar(modalDeletar.id)}
          onCancelar={() => setModalDeletar(null)}
          corBotao="bg-red-600 hover:bg-red-500"
        />
      )}

      {modalToggle && (
        <ModalConfirmacao
          titulo={modalToggle.ativo ? 'Desativar conta' : 'Ativar conta'}
          mensagem={`Deseja ${modalToggle.ativo ? 'desativar' : 'ativar'} a conta de "${modalToggle.nome}"?`}
          onConfirmar={() => handleToggle(modalToggle.id)}
          onCancelar={() => setModalToggle(null)}
          corBotao={modalToggle.ativo ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}
        />
      )}
    </div>
  )
}
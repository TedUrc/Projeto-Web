import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Package, CheckCircle, XCircle } from 'lucide-react'
import api from '../services/api'

export default function ConfirmarEmail() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('aguardando')
  const [carregando, setCarregando] = useState(false)

  async function confirmar() {
    setCarregando(true)
    try {
      await api.get(`/auth/confirmar/${token}`)
      setStatus('sucesso')
    } catch {
      setStatus('erro')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="bg-blue-600 p-3 rounded-2xl inline-block mb-6">
          <Package size={32} className="text-white" />
        </div>

        {status === 'aguardando' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-white font-bold text-lg mb-2">Confirmar conta</h2>
            <p className="text-gray-400 text-sm mb-6">
              Clique no botão abaixo para ativar sua conta.
            </p>
            <button
              onClick={confirmar}
              disabled={carregando}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              {carregando ? 'Confirmando...' : 'Ativar minha conta'}
            </button>
          </div>
        )}

        {status === 'sucesso' && (
          <div className="bg-green-900/30 border border-green-800 rounded-2xl p-8">
            <CheckCircle size={40} className="text-green-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-lg mb-2">Conta confirmada!</h2>
            <p className="text-gray-400 text-sm mb-6">
              Sua conta foi ativada com sucesso. Você já pode fazer login.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              Fazer login
            </button>
          </div>
        )}

        {status === 'erro' && (
          <div className="bg-red-900/30 border border-red-800 rounded-2xl p-8">
            <XCircle size={40} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-lg mb-2">Link inválido</h2>
            <p className="text-gray-400 text-sm mb-6">
              Este link de confirmação é inválido ou já expirou.
            </p>
            <button
              onClick={() => navigate('/registro')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              Criar nova conta
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
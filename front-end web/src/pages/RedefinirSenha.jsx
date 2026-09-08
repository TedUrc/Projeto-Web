import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Package, Eye, EyeOff, CheckCircle } from 'lucide-react'
import api from '../services/api'

function RequisitosSenh({ senha }) {
  if (!senha) return null
  const requisitos = [
    { label: 'Mínimo 8 caracteres', ok: senha.length >= 8 },
    { label: 'Uma letra maiúscula', ok: /[A-Z]/.test(senha) },
    { label: 'Um número',           ok: /[0-9]/.test(senha) },
  ]
  return (
    <div className="flex flex-col gap-1 mt-1">
      {requisitos.map(({ label, ok }) => (
        <div key={label} className="flex items-center gap-2 text-xs">
          <span className={ok ? 'text-green-400' : 'text-red-400'}>{ok ? '✓' : '✗'}</span>
          <span className={ok ? 'text-green-400' : 'text-gray-500'}>{label}</span>
        </div>
      ))}
    </div>
  )
}

export default function RedefinirSenha() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (senha.length < 8) return setErro('Senha deve ter pelo menos 8 caracteres')
    if (!/[A-Z]/.test(senha)) return setErro('Senha deve ter pelo menos uma letra maiúscula')
    if (!/[0-9]/.test(senha)) return setErro('Senha deve ter pelo menos um número')
    if (senha !== confirmar) return setErro('As senhas não coincidem')

    setCarregando(true)
    try {
      await api.post('/auth/redefinir-senha', { token, nova_senha: senha })
      setSucesso(true)
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao redefinir senha')
    } finally {
      setCarregando(false)
    }
  }

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-green-900/30 border border-green-800 rounded-2xl p-8">
            <CheckCircle size={40} className="text-green-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-lg mb-2">Senha redefinida!</h2>
            <p className="text-gray-400 text-sm mb-6">
              Sua senha foi alterada com sucesso. Você já pode fazer login.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              Fazer login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl mb-4">
            <Package size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Nova senha</h1>
          <p className="text-gray-400 text-sm mt-1">Defina sua nova senha</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Nova senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-11 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <RequisitosSenh senha={senha} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Confirmar senha</label>
              <div className="relative">
                <input
                  type={mostrarConfirmar ? 'text' : 'password'}
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-11 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {mostrarConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmar && senha !== confirmar && (
                <p className="text-red-400 text-xs">As senhas não coincidem</p>
              )}
            </div>

            {erro && (
              <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium py-3 rounded-lg text-sm transition-colors mt-2"
            >
              {carregando ? 'Salvando...' : 'Redefinir senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
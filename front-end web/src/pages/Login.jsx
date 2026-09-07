import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Package, LogIn, Eye, EyeOff } from 'lucide-react'
import InputField from '../components/ui/InputField'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    setErro('')
    setCarregando(true)
    try {
      // Normalização do e-mail antes do envio
      await login(email.trim().toLowerCase(), senha)
      navigate('/dashboard')
    } catch (err) {
      const status = err.response?.status
      const detail = err.response?.data?.detail

      if (status === 403 && detail?.includes('não confirmada')) {
        setErro('Conta não confirmada. Verifique seu e-mail e clique no link de ativação.')
      } else {
        setErro('Email ou senha incorretos')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl mb-4">
            <Package size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Logística</h1>
          <p className="text-gray-400 text-sm mt-1">Entre na sua conta</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              required
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
            </div>

            {erro && (
              <div className={`border rounded-lg px-4 py-3 text-sm ${
                erro.includes('não confirmada')
                  ? 'bg-yellow-900/30 border-yellow-800 text-yellow-400'
                  : 'bg-red-900/30 border-red-800 text-red-400'
              }`}>
                {erro}
                {erro.includes('não confirmada') && (
                  <p className="text-xs mt-1 opacity-80">
                    Não recebeu o e-mail? Verifique sua caixa de spam.
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors mt-2"
              onClick={(e) => {
                e.preventDefault()
                handleSubmit(e)
              }}
            >
              <LogIn size={16} />
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>

            <button 
              type="button" 
              onClick={() => navigate('/registro')} 
              className="text-center text-gray-400 hover:text-white text-sm transition-colors"
            >
              Não tem conta? <span className="text-blue-400">Criar conta</span>
            </button>

            <button 
              type="button" 
              onClick={() => navigate('/recuperar-senha')} 
              className="text-center text-gray-500 hover:text-gray-300 text-xs transition-colors"
            >
              Esqueci minha senha
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
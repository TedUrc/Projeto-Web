import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ArrowLeft, Mail } from 'lucide-react'

export default function RecuperarSenha() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setCarregando(true)
    // Por enquanto simula o envio
    // Quando integrar o serviço de email, a chamada vai aqui
    await new Promise(resolve => setTimeout(resolve, 1000))
    setEnviado(true)
    setCarregando(false)
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-blue-900/30 border border-blue-800 rounded-2xl p-8">
            <Mail size={40} className="text-blue-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-lg mb-2">Email enviado</h2>
            <p className="text-gray-400 text-sm mb-2">
              Se esse email estiver cadastrado, você receberá as instruções de recuperação.
            </p>
            <p className="text-gray-500 text-xs mb-6">{email}</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              Voltar para o login
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
          <h1 className="text-2xl font-bold text-white">Recuperar senha</h1>
          <p className="text-gray-400 text-sm mt-1 text-center">
            Informe seu email para receber as instruções
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Email cadastrado</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <Mail size={16} />
              {carregando ? 'Enviando...' : 'Enviar instruções'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-center text-gray-400 hover:text-white text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} />
              Voltar para o login
            </button>

          </form>
        </div>

      </div>
    </div>
  )
}
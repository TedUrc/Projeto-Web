import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, UserPlus, Eye, EyeOff } from 'lucide-react'
import api from '../services/api'
import ErroBox from '../components/ui/ErroBox'

function CampoSenha({ label, value, onChange, placeholder, mostrar, onToggle }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-400">{label}</label>
      <div className="relative">
        <input
          type={mostrar ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-11 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
        >
          {mostrar ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

function Requisitossenha({ senha }) {
  const requisitos = [
    { label: 'Mínimo 8 caracteres', ok: senha.length >= 8 },
    { label: 'Uma letra maiúscula', ok: /[A-Z]/.test(senha) },
    { label: 'Um número',           ok: /[0-9]/.test(senha) },
  ]

  if (!senha) return null

  return (
    <div className="flex flex-col gap-1 mt-1">
      {requisitos.map(({ label, ok }) => (
        <div key={label} className="flex items-center gap-2 text-xs">
          <span className={ok ? 'text-green-400' : 'text-red-400'}>
            {ok ? '✓' : '✗'}
          </span>
          <span className={ok ? 'text-green-400' : 'text-gray-500'}>{label}</span>
        </div>
      ))}
    </div>
  )
}

function validarFormulario(form) {
  if (!form.nome.trim()) return 'Nome é obrigatório'
  if (!/^[A-Za-zÀ-ÿ\s]+$/.test(form.nome)) return 'Nome deve conter apenas letras e espaços'
  if (!form.email.trim()) return 'Email é obrigatório'
  if (form.senha.length < 8) return 'Senha deve ter pelo menos 8 caracteres'
  if (!/[A-Z]/.test(form.senha)) return 'Senha deve ter pelo menos uma letra maiúscula'
  if (!/[0-9]/.test(form.senha)) return 'Senha deve ter pelo menos um número'
  if (form.senha !== form.confirmarSenha) return 'As senhas não coincidem'
  return null
}

export default function Registro() {
  const [form, setForm] = useState({ email: '', nome: '', senha: '', confirmarSenha: '' })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    const erroValidacao = validarFormulario(form)
    if (erroValidacao) return setErro(erroValidacao)

    setCarregando(true)
    try {
      await api.post('/auth/register', {
        email: form.email,
        nome: form.nome,
        senha: form.senha,
      })
      setSucesso(true)
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setErro(detail[0]?.msg || 'Erro ao criar conta')
      } else {
        setErro(detail || 'Erro ao criar conta')
      }
    } finally {
      setCarregando(false)
    }
  }

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-blue-900/30 border border-blue-800 rounded-2xl p-8">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-white font-bold text-lg mb-2">Verifique seu e-mail</h2>
            <p className="text-gray-400 text-sm mb-2">
              Enviamos um link de confirmação para:
            </p>
            <p className="text-blue-400 text-sm font-medium mb-4">{form.email}</p>
            <p className="text-gray-500 text-xs mb-6">
              Clique no link do e-mail para ativar sua conta.
              O link expira em 3 dias.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              Ir para o login
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
          <h1 className="text-2xl font-bold text-white">Criar conta</h1>
          <p className="text-gray-400 text-sm mt-1">Preencha seus dados</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Nome completo</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Seu nome"
                required
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com"
                required
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <CampoSenha
                label="Senha"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                placeholder="Mínimo 8 caracteres"
                mostrar={mostrarSenha}
                onToggle={() => setMostrarSenha(!mostrarSenha)}
              />
              <Requisitossenha senha={form.senha} />
            </div>

            <CampoSenha
              label="Confirmar senha"
              value={form.confirmarSenha}
              onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })}
              placeholder="Repita a senha"
              mostrar={mostrarConfirmar}
              onToggle={() => setMostrarConfirmar(!mostrarConfirmar)}
            />

            <ErroBox mensagem={erro} />

            <button
              type="submit"
              disabled={carregando}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <UserPlus size={16} />
              {carregando ? 'Criando conta...' : 'Criar conta'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-center text-gray-400 hover:text-white text-sm transition-colors"
            >
              Já tem conta? <span className="text-blue-400">Entrar</span>
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}
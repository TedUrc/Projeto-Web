import { useState } from 'react'
import ErroBox from '../ui/ErroBox'

const REGEX_CODIGO = /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/

function validarForm(form) {
  const codigo = form.codigo_rastreio.trim().toUpperCase()
  if (!REGEX_CODIGO.test(codigo)) {
    return 'Código inválido. Use o formato dos Correios: AA000000000AA'
  }
  if (!form.destinatario.trim()) return 'Destinatário é obrigatório'
  if (!/^[A-Za-zÀ-ÿ\s]+$/.test(form.destinatario)) {
    return 'Destinatário deve conter apenas letras e espaços'
  }
  if (form.endereco.trim().length < 10) return 'Endereço muito curto'
  return null
}

export default function ModalCriarProduto({ motoristas, onCriar, onFechar }) {
  const [form, setForm] = useState({
    codigo_rastreio: '', destinatario: '', endereco: '', motorista_id: ''
  })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    const erroValidacao = validarForm(form)
    if (erroValidacao) return setErro(erroValidacao)

    setSalvando(true)
    try {
      await onCriar({
        ...form,
        codigo_rastreio: form.codigo_rastreio.trim().toUpperCase()
      })
      onFechar()
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setErro(detail[0]?.msg || 'Erro ao criar produto')
      } else {
        setErro(detail || 'Erro ao criar produto')
      }
    } finally {
      setSalvando(false)
    }
  }

  const campos = [
    {
      key: 'codigo_rastreio',
      label: 'Código de Rastreio',
      placeholder: 'BR123456789BR',
      hint: 'Formato: AA000000000AA'
    },
    {
      key: 'destinatario',
      label: 'Destinatário',
      placeholder: 'Nome completo',
      hint: null
    },
    {
      key: 'endereco',
      label: 'Endereço',
      placeholder: 'Rua, número, cidade',
      hint: null
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-white font-bold mb-4">Novo Produto</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {campos.map(({ key, label, placeholder, hint }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">{label}</label>
              <input
                type="text"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                required
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {hint && <p className="text-gray-500 text-xs">{hint}</p>}
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Atribuir motorista (opcional)</label>
            <select
              value={form.motorista_id}
              onChange={(e) => setForm({ ...form, motorista_id: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Sem motorista</option>
              {motoristas.map(m => (
                <option key={m.id} value={m.id}>{m.nome} — {m.email}</option>
              ))}
            </select>
          </div>

          <ErroBox mensagem={erro} />

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white py-3 rounded-lg text-sm font-medium transition-colors"
            >
              {salvando ? 'Salvando...' : 'Criar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
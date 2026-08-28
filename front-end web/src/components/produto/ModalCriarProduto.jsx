import { useState } from 'react'
import ErroBox from '../ui/ErroBox'

export default function ModalCriarProduto({ motoristas, onCriar, onFechar }) {
  const [form, setForm] = useState({
    codigo_rastreio: '', destinatario: '', endereco: '', motorista_id: ''
  })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      await onCriar(form)
      onFechar()
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao criar produto')
    } finally {
      setSalvando(false)
    }
  }

  const campos = [
    { key: 'codigo_rastreio', label: 'Código de Rastreio', placeholder: 'BR123456789BR' },
    { key: 'destinatario',    label: 'Destinatário',       placeholder: 'Nome completo' },
    { key: 'endereco',        label: 'Endereço',           placeholder: 'Rua, número, cidade' },
  ]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-white font-bold mb-4">Novo Produto</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {campos.map(({ key, label, placeholder }) => (
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
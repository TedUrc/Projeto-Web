import { useState } from 'react'

function validarDestinatario(v) {
  if (!v.trim()) return 'Destinatário é obrigatório'
  if (!/^[A-Za-zÀ-ÿ\s]+$/.test(v)) return 'Apenas letras e espaços'
  const partes = v.trim().split(' ').filter(p => p.length > 0)
  if (partes.length < 2) return 'Informe nome e sobrenome completos'
  return null
}

export default function ModalCriarProduto({ motoristas, onCriar, onFechar }) {
  const [form, setForm] = useState({
    destinatario: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento_tipo: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    motorista_id: '',
  })
  const [tocado, setTocado] = useState({})
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [cepNaoEncontrado, setCepNaoEncontrado] = useState(false)

  function marcar(campo) {
    setTocado(t => ({ ...t, [campo]: true }))
  }

  async function buscarCep(cep) {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return
    setBuscandoCep(true)
    setCepNaoEncontrado(false)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await res.json()
      if (data.erro) {
        setCepNaoEncontrado(true)
        setForm(f => ({ ...f, logradouro: '', bairro: '', cidade: '', estado: '' }))
      } else {
        setForm(f => ({
          ...f,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
        }))
      }
    } catch {
      setCepNaoEncontrado(true)
    } finally {
      setBuscandoCep(false)
    }
  }

  const erros = {
    destinatario: tocado.destinatario ? validarDestinatario(form.destinatario) : null,
    cep: tocado.cep ? (cepNaoEncontrado ? 'CEP não encontrado' : (!form.cep.replace(/\D/g,'').length === 8 ? 'CEP inválido' : null)) : null,
    numero: tocado.numero && !form.numero.trim() ? 'Número é obrigatório' : null,
    complemento_tipo: tocado.complemento_tipo && !form.complemento_tipo ? 'Selecione o tipo' : null,
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setTocado({ destinatario: true, cep: true, numero: true, complemento_tipo: true })

    if (!form.destinatario || validarDestinatario(form.destinatario)) return
    if (!form.logradouro) return setErro('Busque um CEP válido primeiro')
    if (!form.numero.trim()) return setErro('Número é obrigatório')
    if (!form.complemento_tipo) return setErro('Selecione Casa ou Apartamento')
    if (form.complemento_tipo === 'apartamento' && !form.complemento.trim()) {
      return setErro('Informe o número do apartamento')
    }

    setSalvando(true)
    try {
      await onCriar({
        destinatario: form.destinatario,
        cep: form.cep.replace(/\D/g, ''),
        logradouro: form.logradouro,
        numero: form.numero,
        complemento_tipo: form.complemento_tipo,
        complemento: form.complemento || null,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
        motorista_id: form.motorista_id || null,
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

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md my-4">
        <h2 className="text-white font-bold mb-4">Novo Produto</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Destinatário */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Destinatário</label>
            <input
              type="text"
              value={form.destinatario}
              onChange={(e) => setForm({ ...form, destinatario: e.target.value })}
              onBlur={() => marcar('destinatario')}
              placeholder="Nome e Sobrenome"
              className={`bg-gray-800 border rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none transition-colors ${
                erros.destinatario ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
              }`}
            />
            {erros.destinatario && <p className="text-red-400 text-xs">{erros.destinatario}</p>}
          </div>

          {/* CEP */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">CEP</label>
            <div className="relative">
              <input
                type="text"
                value={form.cep}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 8)
                  setForm({ ...form, cep: v })
                  setCepNaoEncontrado(false)
                  if (v.length === 8) buscarCep(v)
                }}
                onBlur={() => marcar('cep')}
                placeholder="00000000"
                maxLength={8}
                className={`bg-gray-800 border rounded-lg px-4 py-3 pr-10 text-white text-sm placeholder-gray-500 focus:outline-none transition-colors ${
                  cepNaoEncontrado ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
                }`}
              />
              {buscandoCep && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  buscando...
                </div>
              )}
            </div>
            {cepNaoEncontrado && <p className="text-red-400 text-xs">CEP não encontrado</p>}
          </div>

          {/* Logradouro — preenchido automaticamente */}
          {form.logradouro && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Logradouro</label>
                <input
                  type="text"
                  value={form.logradouro}
                  readOnly
                  className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 text-sm cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-400">Número</label>
                  <input
                    type="text"
                    value={form.numero}
                    onChange={(e) => setForm({ ...form, numero: e.target.value })}
                    onBlur={() => marcar('numero')}
                    placeholder="123"
                    className={`bg-gray-800 border rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none transition-colors ${
                      erros.numero ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
                    }`}
                  />
                  {erros.numero && <p className="text-red-400 text-xs">{erros.numero}</p>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-400">Tipo</label>
                  <select
                    value={form.complemento_tipo}
                    onChange={(e) => setForm({ ...form, complemento_tipo: e.target.value, complemento: '' })}
                    onBlur={() => marcar('complemento_tipo')}
                    className={`bg-gray-800 border rounded-lg px-4 py-3 text-white text-sm focus:outline-none transition-colors ${
                      erros.complemento_tipo ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
                    }`}
                  >
                    <option value="">Selecione</option>
                    <option value="casa">Casa</option>
                    <option value="apartamento">Apartamento</option>
                  </select>
                  {erros.complemento_tipo && <p className="text-red-400 text-xs">{erros.complemento_tipo}</p>}
                </div>
              </div>

              {/* Complemento — apartamento obrigatório, casa opcional */}
              {form.complemento_tipo === 'apartamento' && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-400">Número do apartamento <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.complemento}
                    onChange={(e) => setForm({ ...form, complemento: e.target.value })}
                    placeholder="Ex: 101"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              )}

              {form.complemento_tipo === 'casa' && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-400">Complemento <span className="text-gray-500">(opcional)</span></label>
                  <input
                    type="text"
                    value={form.complemento}
                    onChange={(e) => setForm({ ...form, complemento: e.target.value })}
                    placeholder="Ex: Fundos, Bloco A"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Bairro / Cidade / Estado</label>
                <input
                  type="text"
                  value={`${form.bairro} — ${form.cidade}/${form.estado}`}
                  readOnly
                  className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 text-sm cursor-not-allowed"
                />
              </div>
            </>
          )}

          {/* Motorista */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Atribuir motorista <span className="text-gray-500">(opcional)</span></label>
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
            {motoristas.length === 0 && (
              <p className="text-gray-500 text-xs">Nenhum motorista disponível no momento</p>
            )}
          </div>

          {erro && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm">
              {erro}
            </div>
          )}

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
              disabled={salvando || buscandoCep}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white py-3 rounded-lg text-sm font-medium transition-colors"
            >
              {salvando ? 'Criando...' : 'Criar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
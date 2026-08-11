import { useState, useEffect } from 'react'
import api from '../../services/api'

export function useProdutos() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  async function carregarProdutos() {
    try {
      const res = await api.get('/produtos/')
      setProdutos(res.data)
    } catch (err) {
      setErro('Erro ao carregar produtos')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarProdutos()
  }, [])

  async function deletarProduto(id) {
    if (!confirm('Deseja deletar este produto?')) return
    try {
      await api.delete(`/produtos/${id}`)
      await carregarProdutos()
    } catch (err) {
      setErro('Erro ao deletar produto')
    }
  }

  async function criarProduto(form) {
    await api.post('/produtos/', {
      ...form,
      motorista_id: form.motorista_id ? parseInt(form.motorista_id) : null
    })
    await carregarProdutos()
  }

  return { produtos, carregando, erro, carregarProdutos, deletarProduto, criarProduto }
}
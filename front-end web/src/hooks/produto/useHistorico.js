import { useState, useEffect } from 'react'
import api from '../../services/api'

export function useHistorico(produtoId) {
  const [produto, setProduto] = useState(null)
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  async function carregarDados() {
    try {
      const [produtoRes, historicoRes] = await Promise.all([
        api.get(`/produtos/${produtoId}`),
        api.get(`/historico/${produtoId}`)
      ])
      setProduto(produtoRes.data)
      setHistorico(historicoRes.data)
    } catch (err) {
      setErro('Erro ao carregar dados')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [produtoId])

  async function atualizarStatus(status) {
    await api.post(`/historico/${produtoId}/status?status=${encodeURIComponent(status)}`)
    await carregarDados()
  }

  return { produto, historico, carregando, erro, atualizarStatus }
}
import { useState, useEffect } from 'react'
import api from '../../services/api'

export function useStats() {
  const [stats, setStats] = useState({
    total: 0, pendencia: 0, saida: 0, entrega: 0, cancelamento: 0
  })
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        const res = await api.get('/produtos/')
        const produtos = res.data
        setStats({
          total: produtos.length,
          pendencia: produtos.filter(p => p.status === 'pendência').length,
          saida: produtos.filter(p => p.status === 'saída').length,
          entrega: produtos.filter(p => p.status === 'entrega').length,
          cancelamento: produtos.filter(p => p.status === 'cancelamento').length,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  return { stats, carregando }
}
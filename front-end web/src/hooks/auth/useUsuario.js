import { useState, useEffect } from 'react'
import api from '../../services/api'

export function useUsuario() {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        const res = await api.get('/auth/me')
        setUsuario(res.data)
      } catch {}
      finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const isAdmin = usuario?.role === 'admin'

  return { usuario, carregando, isAdmin }
}
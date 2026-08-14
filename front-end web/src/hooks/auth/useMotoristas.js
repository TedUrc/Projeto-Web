import { useState, useEffect } from 'react'
import api from '../../services/api'

export function useMotoristas(isAdmin) {
  const [motoristas, setMotoristas] = useState([])

  useEffect(() => {
    if (!isAdmin) return
    async function carregar() {
      try {
        const res = await api.get('/auth/usuarios')
        setMotoristas(res.data.filter(u => u.role === 'motorista'))
      } catch {}
    }
    carregar()
  }, [isAdmin])

  return { motoristas }
}
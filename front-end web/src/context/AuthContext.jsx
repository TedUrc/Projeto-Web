import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setUsuario({ token })
    }
    setCarregando(false)
  }, [])

  async function login(email, senha) {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', senha)

    const response = await api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })

    const { access_token } = response.data
    localStorage.setItem('token', access_token)
    setUsuario({ token: access_token })
  }

  function logout() {
    localStorage.removeItem('token')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
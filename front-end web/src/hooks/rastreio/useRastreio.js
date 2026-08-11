import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export function useRastreio(produtoId) {
  const [status, setStatus] = useState('idle')
  const [ultimoEnvio, setUltimoEnvio] = useState(null)
  const [produto, setProduto] = useState(null)
  const intervalRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }

    api.get(`/produtos/${produtoId}`)
      .then(res => setProduto(res.data))
      .catch(console.error)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [produtoId])

  function enviarPosicao() {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await api.post(`/localizacao/${produtoId}`, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setUltimoEnvio(new Date().toLocaleTimeString('pt-BR'))
        } catch (err) {
          console.error('Erro ao enviar localização', err)
        }
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    )
  }

  function iniciarRastreio() {
    if (!navigator.geolocation) { setStatus('error'); return }
    navigator.geolocation.getCurrentPosition(
      () => {
        setStatus('tracking')
        enviarPosicao()
        intervalRef.current = setInterval(enviarPosicao, 10000)
      },
      () => setStatus('sem_permissao'),
      { enableHighAccuracy: true }
    )
  }

  function pararRastreio() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setStatus('idle')
    setUltimoEnvio(null)
  }

  return { status, ultimoEnvio, produto, iniciarRastreio, pararRastreio }
}
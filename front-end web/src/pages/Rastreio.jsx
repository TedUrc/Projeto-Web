import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Navigation, WifiOff, CheckCircle, Package } from 'lucide-react'
import api from '../services/api'

export default function Rastreio() {
  const { produtoId } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('idle')
  const [ultimoEnvio, setUltimoEnvio] = useState(null)
  const [produto, setProduto] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    async function carregarProduto() {
      try {
        const response = await api.get(`/produtos/${produtoId}`)
        setProduto(response.data)
      } catch (err) {
        console.error(err)
      }
    }
    carregarProduto()

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [produtoId])

  function iniciarRastreio() {
    if (!navigator.geolocation) {
      setStatus('error')
      return
    }

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

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col gap-4">

        <div className="text-center">
          <div className="bg-blue-600 p-3 rounded-2xl inline-block mb-3">
            <Navigation size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Rastreio do Motorista</h1>
          {produto && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Package size={14} className="text-gray-400" />
              <p className="text-gray-400 text-sm">{produto.codigo_rastreio}</p>
            </div>
          )}
        </div>

        <div className={`rounded-2xl p-6 border text-center ${
          status === 'tracking'
            ? 'bg-green-900/30 border-green-800'
            : status === 'sem_permissao' || status === 'error'
            ? 'bg-red-900/30 border-red-800'
            : 'bg-gray-900 border-gray-800'
        }`}>
          {status === 'idle' && (
            <>
              <Navigation size={32} className="text-gray-500 mx-auto mb-3" />
              <p className="text-gray-300 font-medium">Rastreio inativo</p>
              <p className="text-gray-500 text-sm mt-1">Clique em iniciar para compartilhar sua localização</p>
            </>
          )}

          {status === 'tracking' && (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <p className="text-green-400 font-medium">Rastreio ativo</p>
              </div>
              <p className="text-gray-400 text-sm">Enviando localização a cada 10 segundos</p>
              {ultimoEnvio && (
                <div className="flex items-center justify-center gap-1 mt-3">
                  <CheckCircle size={14} className="text-green-400" />
                  <p className="text-green-400 text-xs">Último envio: {ultimoEnvio}</p>
                </div>
              )}
            </>
          )}

          {status === 'sem_permissao' && (
            <>
              <WifiOff size={32} className="text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-medium">Permissão negada</p>
              <p className="text-gray-400 text-sm mt-1">Permita o acesso à localização nas configurações do navegador</p>
            </>
          )}

          {status === 'error' && (
            <>
              <WifiOff size={32} className="text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-medium">GPS não disponível</p>
              <p className="text-gray-400 text-sm mt-1">Seu dispositivo não suporta geolocalização</p>
            </>
          )}
        </div>

        {status !== 'tracking' ? (
          <button
            onClick={iniciarRastreio}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Navigation size={18} />
            Iniciar rastreio
          </button>
        ) : (
          <button
            onClick={pararRastreio}
            className="bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-400 font-medium py-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <WifiOff size={18} />
            Parar rastreio
          </button>
        )}

        <p className="text-gray-600 text-xs text-center">
          Mantenha essa página aberta para continuar enviando a localização
        </p>

      </div>
    </div>
  )
}
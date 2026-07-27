import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { ArrowLeft, MapPin, Navigation, Package } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../services/api'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const iconeMotorista = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 40px;
      height: 40px;
      background: #3B82F6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 3px #3B82F6, 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

function SeguirMotorista({ posicao, seguindo }) {
  const map = useMap()
  const primeiraVez = useRef(true)

  useEffect(() => {
    if (!posicao) return
    if (primeiraVez.current) {
      map.setView(posicao, 15)
      primeiraVez.current = false
      return
    }
    if (seguindo) {
      map.flyTo(posicao, 15, { animate: true, duration: 1.5 })
    }
  }, [posicao, seguindo, map])

  return null
}

export default function Mapa() {
  const { produtoId } = useParams()
  const navigate = useNavigate()
  const [produto, setProduto] = useState(null)
  const [localizacaoAtual, setLocalizacaoAtual] = useState(null)
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [semLocalizacao, setSemLocalizacao] = useState(false)
  const [seguindo, setSeguindo] = useState(true)

  useEffect(() => {
    async function carregarDados() {
      try {
        const produtoRes = await api.get(`/produtos/${produtoId}`)
        setProduto(produtoRes.data)
      } catch (err) {
        console.error(err)
      }

      try {
        const [atualRes, historicoRes] = await Promise.all([
          api.get(`/localizacao/${produtoId}/atual`),
          api.get(`/localizacao/${produtoId}/historico`)
        ])
        setLocalizacaoAtual(atualRes.data)
        setHistorico(historicoRes.data)
      } catch (err) {
        if (err.response?.status === 404) {
          setSemLocalizacao(true)
        }
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()

    const interval = setInterval(async () => {
      try {
        const [atualRes, historicoRes] = await Promise.all([
          api.get(`/localizacao/${produtoId}/atual`),
          api.get(`/localizacao/${produtoId}/historico`)
        ])
        setLocalizacaoAtual(atualRes.data)
        setHistorico(historicoRes.data)
        setSemLocalizacao(false)
      } catch {}
    }, 5000)

    return () => clearInterval(interval)
  }, [produtoId])

  const posicoes = historico
    .slice()
    .reverse()
    .map(loc => [loc.latitude, loc.longitude])

  const posicaoAtual = localizacaoAtual
    ? [localizacaoAtual.latitude, localizacaoAtual.longitude]
    : null

  const HEADER_HEIGHT = 64

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

      <div
        style={{ height: HEADER_HEIGHT }}
        className="flex items-center justify-between px-4 border-b border-gray-800 bg-gray-900 shrink-0"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/historico/${produtoId}`)}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-white font-bold text-sm">Rastreio ao vivo</h1>
            {produto && (
              <div className="flex items-center gap-1">
                <Package size={11} className="text-gray-400" />
                <p className="text-gray-400 text-xs">{produto.codigo_rastreio}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {localizacaoAtual && (
            <div className="flex items-center gap-1 bg-green-900/30 border border-green-800 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs">Ao vivo</span>
            </div>
          )}
          <button
            onClick={() => setSeguindo(!seguindo)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              seguindo
                ? 'bg-blue-900/30 border-blue-800 text-blue-400'
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            {seguindo ? '📍 Seguindo' : '📍 Fixo'}
          </button>
        </div>
      </div>

      <div style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}>
        {carregando ? (
          <div className="flex items-center justify-center h-full bg-gray-950">
            <p className="text-gray-400 text-sm">Carregando mapa...</p>
          </div>
        ) : semLocalizacao ? (
          <div className="flex flex-col items-center justify-center h-full bg-gray-950 gap-3">
            <MapPin size={40} className="text-gray-700" />
            <p className="text-gray-400 text-sm">Nenhuma localização registrada ainda</p>
            <p className="text-gray-500 text-xs">O motorista precisa iniciar o rastreio</p>
            <button
              onClick={() => navigate(`/rastreio/${produtoId}`)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 mt-2"
            >
              <Navigation size={14} />
              Abrir página do motorista
            </button>
          </div>
        ) : posicaoAtual && (
          <MapContainer
            center={posicaoAtual}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />

            <SeguirMotorista posicao={posicaoAtual} seguindo={seguindo} />

            {posicoes.length > 1 && (
              <>
                <Polyline
                  positions={posicoes}
                  color="#1D4ED8"
                  weight={8}
                  opacity={0.3}
                />
                <Polyline
                  positions={posicoes}
                  color="#3B82F6"
                  weight={4}
                  opacity={0.9}
                />
              </>
            )}

            <Marker position={posicaoAtual} icon={iconeMotorista}>
              <Popup>
                <div className="text-sm">
                  <p className="font-medium">Motorista</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(localizacaoAtual.registrado_em).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {localizacaoAtual.latitude.toFixed(6)}, {localizacaoAtual.longitude.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>

          </MapContainer>
        )}
      </div>

    </div>
  )
}
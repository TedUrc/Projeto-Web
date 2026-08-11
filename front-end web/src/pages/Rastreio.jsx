import { useParams } from 'react-router-dom'
import { Navigation, WifiOff, CheckCircle, Package } from 'lucide-react'
import { useRastreio } from '../hooks/rastreio/useRastreio'

function StatusCard({ status, ultimoEnvio }) {
  const configs = {
    idle: {
      classe: 'bg-gray-900 border-gray-800',
      conteudo: (
        <>
          <Navigation size={32} className="text-gray-500 mx-auto mb-3" />
          <p className="text-gray-300 font-medium">Rastreio inativo</p>
          <p className="text-gray-500 text-sm mt-1">Clique em iniciar para compartilhar sua localização</p>
        </>
      )
    },
    tracking: {
      classe: 'bg-green-900/30 border-green-800',
      conteudo: (
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
      )
    },
    sem_permissao: {
      classe: 'bg-red-900/30 border-red-800',
      conteudo: (
        <>
          <WifiOff size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-medium">Permissão negada</p>
          <p className="text-gray-400 text-sm mt-1">Permita o acesso à localização nas configurações do navegador</p>
        </>
      )
    },
    error: {
      classe: 'bg-red-900/30 border-red-800',
      conteudo: (
        <>
          <WifiOff size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-medium">GPS não disponível</p>
          <p className="text-gray-400 text-sm mt-1">Seu dispositivo não suporta geolocalização</p>
        </>
      )
    }
  }

  const config = configs[status] || configs.idle

  return (
    <div className={`rounded-2xl p-6 border text-center ${config.classe}`}>
      {config.conteudo}
    </div>
  )
}

export default function Rastreio() {
  const { produtoId } = useParams()
  const { status, ultimoEnvio, produto, iniciarRastreio, pararRastreio } = useRastreio(produtoId)

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

        <StatusCard status={status} ultimoEnvio={ultimoEnvio} />

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
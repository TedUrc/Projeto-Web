export default function LoadingScreen({ texto = 'Carregando...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-blue-400 text-sm">{texto}</div>
    </div>
  )
}
export default function ErroBox({ mensagem }) {
  if (!mensagem) return null
  return (
    <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm">
      {mensagem}
    </div>
  )
}
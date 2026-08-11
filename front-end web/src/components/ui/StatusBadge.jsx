const STATUS_CORES = {
  'pendência': 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
  'saída': 'bg-purple-900/30 text-purple-400 border-purple-800',
  'entrega': 'bg-green-900/30 text-green-400 border-green-800',
  'cancelamento': 'bg-red-900/30 text-red-400 border-red-800',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_CORES[status] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
      {status}
    </span>
  )
}
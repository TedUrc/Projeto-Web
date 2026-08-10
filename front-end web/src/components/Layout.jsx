import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="md:pl-56 pb-16 md:pb-0">
      <Navbar />
      {children}
    </div>
  )
}
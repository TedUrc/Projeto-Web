import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Registro from './pages/Registro'
import RecuperarSenha from './pages/RecuperarSenha'
import Dashboard from './pages/Dashboard'
import Produtos from './pages/Produtos'
import Historico from './pages/Historico'
import Perfil from './pages/Perfil'
import Usuarios from './pages/Usuarios'
import Rastreio from './pages/Rastreio'
import Mapa from './pages/Mapa'
import RotaProtegida from './components/RotaProtegida'
import ConfirmarEmail from './pages/ConfirmarEmail'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/rastreio/:produtoId" element={<Rastreio />} />

      <Route path="/dashboard" element={
        <RotaProtegida><Dashboard /></RotaProtegida>
      } />

      <Route path="/produtos" element={
        <RotaProtegida><Produtos /></RotaProtegida>
      } />

      <Route path="/historico/:produtoId" element={
        <RotaProtegida><Historico /></RotaProtegida>
      } />

      <Route path="/historico" element={
        <RotaProtegida><Produtos /></RotaProtegida>
      } />

      <Route path="/perfil" element={
        <RotaProtegida><Perfil /></RotaProtegida>
      } />

      <Route path="/usuarios" element={
        <RotaProtegida apenasAdmin={true}><Usuarios /></RotaProtegida>
      } />

      <Route path="/mapa/:produtoId" element={
        <RotaProtegida><Mapa /></RotaProtegida>
      } />
      
      <Route path="/confirmar/:token" element={<ConfirmarEmail />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
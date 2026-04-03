import { Navigate } from "react-router-dom"

export default function PrivateRoute({ children }: any) {
  const logado = localStorage.getItem("admin_logado")

  if (!logado) {
    return <Navigate to="/login" />
  }

  return children
}
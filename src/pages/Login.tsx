import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [senha, setSenha] = useState("")
  const navigate = useNavigate()

  function entrar(e: any) {
    e.preventDefault()

    if (senha === "1234") { // <- pode trocar depois
      localStorage.setItem("admin_logado", "true")
      navigate("/admin")
    } else {
      alert("Senha incorreta")
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Login Admin</h2>

      <form onSubmit={entrar}>
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <br /><br />
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}
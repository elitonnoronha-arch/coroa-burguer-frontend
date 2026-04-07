import { useEffect, useState } from "react"
import type { CSSProperties } from "react"
import axios from "axios"

const API_URL = "http://localhost:3001"

export default function Dashboard() {

  const [dados, setDados] = useState<any>(null)

  useEffect(() => {
    const buscar = async () => {
      const res = await axios.get(`${API_URL}/dashboard`)
      setDados(res.data)
    }

    buscar()
  }, [])

  if (!dados) return <h2>Carregando...</h2>

  return (
    <div style={container}>

      <h1 style={{ textAlign: "center" }}>
        📊 Dashboard Coroa Burguer
      </h1>

      {/* HOJE */}
      <h2>📅 Hoje</h2>
      <div style={grid}>
        <Card titulo="💰 Faturamento" valor={`R$ ${dados.hoje.faturamento.toFixed(2)}`} />
        <Card titulo="📦 Pedidos" valor={dados.hoje.pedidos} />
        <Card titulo="👥 Visitas" valor={dados.hoje.visitas} />
        <Card titulo="📈 Conversão" valor={`${dados.hoje.conversao}%`} />
      </div>

      {/* SEMANA */}
      <h2>📅 Semana</h2>
      <div style={grid}>
        <Card titulo="💰 Faturamento" valor={`R$ ${dados.semana.faturamento.toFixed(2)}`} />
        <Card titulo="📦 Pedidos" valor={dados.semana.pedidos} />
        <Card titulo="👥 Visitas" valor={dados.semana.visitas} />
      </div>

      {/* MÊS */}
      <h2>📅 Mês</h2>
      <div style={grid}>
        <Card titulo="💰 Faturamento" valor={`R$ ${dados.mes.faturamento.toFixed(2)}`} />
        <Card titulo="📦 Pedidos" valor={dados.mes.pedidos} />
        <Card titulo="👥 Visitas" valor={dados.mes.visitas} />
      </div>

    </div>
  )
}

// 🎨 ESTILO
const container = {
  padding: 20,
  background: "#f4f6f9",
  minHeight: "100vh"
}

const grid: CSSProperties = {
  display: "flex",
  gap: 15,
  flexWrap: "wrap",
  marginBottom: 30
}

// 💎 CARD
function Card({ titulo, valor }: any) {
  return (
    <div style={{
      background: "#fff",
      padding: 20,
      borderRadius: 12,
      minWidth: 180,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}>
      <p style={{ margin: 0, color: "#777" }}>{titulo}</p>
      <h2 style={{ margin: 5 }}>{valor}</h2>
    </div>
  )
}
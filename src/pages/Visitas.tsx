
import { useEffect, useState } from "react"
import type { CSSProperties } from "react"
import axios from "axios"


{/*const API_URL = "http://localhost:3001" */}

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://coroa-burguer-backend-1.onrender.com";

export default function Visitas() {

  const [visitas, setVisitas] = useState<any>({})
  const [historico, setHistorico] = useState<any>({})

  // ===============================
  // 🔄 VISITAS TEMPO REAL
  // ===============================
  useEffect(() => {
    const buscarVisitas = async () => {
      try {
        const res = await axios.get(`${API_URL}/visitas`)
        setVisitas(res.data || {})
      } catch (err) {
        console.log(err)
      }
    }

    buscarVisitas()
    const intervalo = setInterval(buscarVisitas, 3000)

    return () => clearInterval(intervalo)
  }, [])

  // ===============================
  // 📊 HISTÓRICO
  // ===============================
  useEffect(() => {
    const buscarHistorico = async () => {
      try {
        const res = await axios.get(`${API_URL}/historico`)
        setHistorico(res.data || {})
      } catch (err) {
        console.log(err)
      }
    }

    buscarHistorico()
  }, [])

  const lista = Object.entries(visitas)

  // ===============================
  // 📊 MÉTRICAS
  // ===============================
  const total = lista.length

  const online = lista.filter(([, v]: any) => v.ativo).length

  const tempoMedio =
    total > 0
      ? (
          lista.reduce((acc: number, [, v]: any) => acc + v.tempo, 0) / total
        ).toFixed(1)
      : "0"

  // ===============================
  // 🔥 ORDENAÇÃO
  // ===============================
  const ordenado = [...lista].sort((a: any, b: any) => {
    const aOnline = a[1].ativo ? 1 : 0
    const bOnline = b[1].ativo ? 1 : 0

    if (bOnline !== aOnline) return bOnline - aOnline

    return b[1].tempo - a[1].tempo
  })

  // ===============================
  // 🏆 TOP 5
  // ===============================
  const top5 = [...lista]
    .sort((a: any, b: any) => b[1].tempo - a[1].tempo)
    .slice(0, 5)

  // ===============================
  // ⏱ FORMATAR TEMPO
  // ===============================
  const formatarTempo = (tempo: number) => {
    const min = Math.floor(tempo / 60)
    const seg = Math.floor(tempo % 60)
    return `${min}m ${seg}s`
  }

  // ===============================
  // 📅 HISTÓRICO CALCULOS
  // ===============================
  const hoje = new Date().toISOString().slice(0, 10)

  const dias = Object.entries(historico)

  const hojeDados = historico[hoje] || {
    visitantes: 0,
    tempoTotal: 0
  }

  const semana = dias.slice(-7)
  const mes = dias.slice(-30)

  const somar = (lista: any[]) => {
    return lista.reduce((acc, [_, v]: any) => {
      return {
        visitantes: acc.visitantes + v.visitantes,
        tempoTotal: acc.tempoTotal + v.tempoTotal
      }
    }, { visitantes: 0, tempoTotal: 0 })
  }

  const semanaDados = somar(semana)
  const mesDados = somar(mes)

  return (
    <div style={{
      background: "#f4f6f9",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 1100,
        padding: 20
      }}>

        {/* =============================== */}
        {/* 🔥 TÍTULO */}
        {/* =============================== */}
        <h1 style={{ textAlign: "center" }}>
          👥 Painel Profissional de Visitantes
        </h1>

        {/* =============================== */}
        {/* 📅 HISTÓRICO */}
        {/* =============================== */}
        <div style={grid}>
          <Card titulo="📅 Hoje" valor={hojeDados.visitantes} />
          <Card titulo="📆 Semana" valor={semanaDados.visitantes} />
          <Card titulo="🗓 Mês" valor={mesDados.visitantes} />
        </div>

        {/* =============================== */}
        {/* 📊 MÉTRICAS */}
        {/* =============================== */}
        <div style={grid}>
          <Card titulo="👤 Total" valor={total} />
          <Card titulo="🟢 Online" valor={online} />
          <Card titulo="⏱ Tempo médio" valor={`${tempoMedio}s`} />
        </div>

        {/* =============================== */}
        {/* 🏆 TOP 5 */}
        {/* =============================== */}
        <Box>
          <h2>🏆 Top 5 Visitantes</h2>

          {top5.map(([id, v]: any, i) => (
            <div key={id} style={linha}>
              <b>#{i + 1} - {id}</b>
              <span>{formatarTempo(v.ativo ? v.tempo : v.tempo_final || v.tempo)}</span>
            </div>
          ))}
        </Box>

        {/* =============================== */}
        {/* 📡 TEMPO REAL */}
        {/* =============================== */}
        <Box>
          <h2>📡 Visitantes em Tempo Real</h2>

          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {ordenado.map(([id, v]: any) => (
              <div key={id} style={linha}>
                <div>
                  <p style={{ margin: 0, fontSize: 12 }}>ID: {id}</p>
                  <p style={{
                    margin: 0,
                    fontWeight: "bold",
                    color: v.ativo ? "#2ecc71" : "#e74c3c"
                  }}>
                    {v.ativo ? "🟢 Online" : "🔴 Saiu"}
                  </p>
                </div>

                <b>{formatarTempo(v.tempo)}</b>
              </div>
            ))}
          </div>
        </Box>

      </div>
    </div>
  )
}

// ===============================
// 💎 COMPONENTES
// ===============================

const grid: CSSProperties = {
  display: "flex",
  gap: 15,
  flexWrap: "wrap",
  justifyContent: "center",
  marginTop: 20
}

const Box = ({ children }: any) => (
  <div style={{
    marginTop: 25,
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  }}>
    {children}
  </div>
)

const linha: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: 10,
  borderBottom: "1px solid #eee"
}

function Card({ titulo, valor }: { titulo: string, valor: any }) {
  return (
    <div style={{
      background: "#fff",
      padding: 15,
      borderRadius: 12,
      boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
      minWidth: 180,
      textAlign: "center"
    }}>
      <p style={{ margin: 0, color: "#777" }}>{titulo}</p>
      <h2>{valor}</h2>
    </div>
  )
}
import { useEffect, useState } from "react"
import axios from "axios"

const API_URL = "http://localhost:3001"

export default function Visitas() {

  const [visitas, setVisitas] = useState<any>({})

  // 🔄 buscar visitas
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

  const lista = Object.entries(visitas)

  // 📊 métricas
  const total = lista.length

  const online = lista.filter(([, v]: any) => v.ativo).length

  const tempoMedio =
    total > 0
      ? (
          lista.reduce((acc: number, [, v]: any) => acc + v.tempo, 0) / total
        ).toFixed(1)
      : "0"

  // 🔥 ordenar (online primeiro)
  const ordenado = lista.sort((a: any, b: any) => {
  const aOnline = a[1].ativo ? 1 : 0
  const bOnline = b[1].ativo ? 1 : 0

  if (bOnline !== aOnline) {
    return bOnline - aOnline
  }

  // se ambos iguais, ordena por tempo (maior primeiro)
  return b[1].tempo - a[1].tempo
})

  // ⏱ formatar tempo
  const formatarTempo = (tempo: number) => {
    const min = Math.floor(tempo / 60)
    const seg = Math.floor(tempo % 60)
    return `${min}m ${seg}s`
  }

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

        <h1 style={{ textAlign: "center" }}>
          👥 Painel de Visitantes
        </h1>

        {/* CARDS */}
        <div style={{
          display: "flex",
          gap: 15,
          marginTop: 20,
          flexWrap: "wrap",
          justifyContent: "center"
        }}>

          <Card titulo="👤 Total" valor={total} />
          <Card titulo="🟢 Online" valor={online} />
          <Card titulo="⏱ Tempo médio" valor={`${tempoMedio}s`} />

        </div>

        {/* LISTA */}
        <div style={{
          marginTop: 25,
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
        }}>

          <h2 style={{ marginBottom: 15 }}>
            📡 Visitantes em Tempo Real
          </h2>

          <div style={{
            maxHeight: 400,
            overflowY: "auto"
          }}>

            {ordenado.map(([id, v]: any) => {

              return (
                <div key={id} style={{
                  borderBottom: "1px solid #eee",
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>

                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: "#777" }}>
                      ID: {id}
                    </p>

                    <p style={{
                      margin: 0,
                      fontWeight: "bold",
                      color: v.ativo ? "#2ecc71" : "#e74c3c"
                    }}>
                      {v.ativo ? "🟢 Online" : "🔴 Saiu"}
                    </p>
                  </div>

                  <div style={{
                    fontWeight: "bold",
                    fontSize: 16
                  }}>
                    {formatarTempo(v.tempo)}
                  </div>

                </div>
              )
            })}

          </div>

        </div>

      </div>
    </div>
  )
}

// 💎 CARD
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
      <p style={{ margin: 0, fontSize: 14, color: "#777" }}>
        {titulo}
      </p>
      <h2 style={{ margin: 5 }}>
        {valor}
      </h2>
    </div>
  )
}
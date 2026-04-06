import { useEffect, useState } from "react";
import axios from "axios";

export default function Visitas() {
  const [dados, setDados] = useState<any>({});

  useEffect(() => {
    axios.get("http://localhost:3001/visitas")
      .then(res => setDados(res.data));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>👥 Controle de Visitantes</h1>

      {Object.entries(dados).map(([id, v]: any) => (
        <div key={id} style={{
          background: "#fff",
          padding: 10,
          marginBottom: 10,
          borderRadius: 10
        }}>
          <p>ID: {id}</p>
          <p>Ativo: {v.ativo ? "🟢 Sim" : "🔴 Não"}</p>
          <p>Tempo: {v.tempo ? v.tempo.toFixed(1) + "s" : "..."}</p>
        </div>
      ))}
    </div>
  );
}
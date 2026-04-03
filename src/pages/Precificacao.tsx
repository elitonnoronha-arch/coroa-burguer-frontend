import { useState } from "react";

export default function Precificacao() {
  const [ingredientes, setIngredientes] = useState([
    { nome: "Pão", custo: 1.5 },
    { nome: "Carne", custo: 4 },
    { nome: "Queijo", custo: 2 },
  ]);

  const [embalagem, setEmbalagem] = useState(1.5);
  const [taxaIfood, setTaxaIfood] = useState(27);
  const [taxaEntrega, setTaxaEntrega] = useState(5);
  const [lucroDesejado, setLucroDesejado] = useState(30);

  const custoIngredientes = ingredientes.reduce(
    (total, i) => total + i.custo,
    0
  );

  const custoTotal = custoIngredientes + embalagem;

  const taxaTotal = (taxaIfood + taxaEntrega) / 100;
  const lucro = lucroDesejado / 100;

  const precoIdeal = custoTotal / (1 - taxaTotal - lucro);
  const lucroLiquido = precoIdeal * lucro;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fff5f5, #ffe3e3)",      padding: 30,
      display: "flex",
      justifyContent: "center"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 900,
        background: "#fff",
        borderRadius: 16,
        padding: 30,
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}>

        

        <h1 style={{ color: "#d62828", marginBottom: 20 }}>
          💰 Precificação Profissional
        </h1>

        {/* INGREDIENTES */}
        <div style={box}>
  <h3>🧾 Ingredientes</h3>

        {ingredientes.map((ing, i) => (
          <div key={i} style={{
            display: "flex",
            gap: 10,
            marginBottom: 10
          }}>
            <input
              value={ing.nome}
              onChange={(e) => {
                const novo = [...ingredientes];
                novo[i].nome = e.target.value;
                setIngredientes(novo);
              }}
              style={inputStyle}
            />

            <input
              type="number"
              value={ing.custo}
              onChange={(e) => {
                const novo = [...ingredientes];
                novo[i].custo = Number(e.target.value);
                setIngredientes(novo);
              }}
              style={inputStyle}
            />
          </div>
          
        ))}

        <button style={btnAdd} onClick={() =>
          setIngredientes([...ingredientes, { nome: "", custo: 0 }])
        }>
          + Ingrediente
        </button>
        </div>

        <hr style={hr} />

        {/* CUSTOS */}
        <div style={box}>
  <h3>📦 Custos</h3>
        <label>Embalagem</label>
        <input
          type="number"
          value={embalagem}
          onChange={(e) => setEmbalagem(Number(e.target.value))}
          style={inputStyle}
        />

        <hr style={hr} />

        {/* TAXAS */}
        <div style={box}>
  <h3>📊 Taxas (iFood + Entrega + Lucro)</h3>
  <p style={{ fontSize: 12, color: "#666" }}>
  ⚠️ As taxas são descontadas sobre o valor total do pedido
</p>

        <div style={{ display: "flex", gap: 10 }}>
            {/*<label>Ifood</label>*/}
          <input
            type="number"
            value={taxaIfood}
            onChange={(e) => setTaxaIfood(Number(e.target.value))}
            placeholder="iFood %"
            style={inputStyle}
          />
           {/*<label>Entrega</label>*/}
          <input
            type="number"
            value={taxaEntrega}
            onChange={(e) => setTaxaEntrega(Number(e.target.value))}
            placeholder="Entrega %"
            style={inputStyle}
          />

           {/*<label>Lucro</label>*/}
          <input
            type="number"
            value={lucroDesejado}
            onChange={(e) => setLucroDesejado(Number(e.target.value))}
            placeholder="Lucro %"
            style={inputStyle}
          />
          </div>
        </div>
        </div>


        <hr style={hr} />

        {/* RESULTADO */}
        <div style={{
  background: "#d62828",
  color: "#fff",
  padding: 25,
  borderRadius: 16,
  boxShadow: "0 15px 40px rgba(0,0,0,0.2)"
}}>
  <h2>📊 Resultado</h2>

  <p>🧾 Ingredientes: R$ {custoIngredientes.toFixed(2)}</p>
  <p>📦 Custo total: R$ {custoTotal.toFixed(2)}</p>

  <hr style={{ borderColor: "rgba(255,255,255,0.3)" }} />

  <p style={{ fontSize: 20 }}>
    💰 <b>Preço ideal: R$ {precoIdeal.toFixed(2)}</b>
  </p>

  <p>
    🟢 Lucro líquido: <b>R$ {lucroLiquido.toFixed(2)}</b>
  </p>

  <p style={{ fontSize: 12, marginTop: 10 }}>
    Taxa total: {(taxaTotal * 100).toFixed(0)}%
  </p>
</div>

      </div>
    </div>
  );
}

// 🎨 estilos reutilizáveis
const inputStyle = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  width: "100%",
  outline: "none"
};

const btnAdd = {
  marginTop: 10,
  padding: "8px 12px",
  borderRadius: 8,
  border: "none",
  background: "#2a9d8f",
  color: "#fff",
  cursor: "pointer"
};

const hr = {
  margin: "20px 0",
  border: "none",
  borderTop: "1px solid #eee"
};

const box = {
  background: "#fff",
  padding: 20,
  borderRadius: 14,
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  marginBottom: 20
};
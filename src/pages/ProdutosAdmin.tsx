import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

{/*const API_URL = "https://coroa-burguer-backend-1.onrender.com";*/}
const API_URL = "http://localhost:3001";



type Produto = {
  id: number;
  nome: string;
  preco: number;
  imagem: string;
  categoria: string;
  ingredientes?: string[] | string;
};

export default function ProdutosAdmin() {
  // ==================== ESTADOS ====================
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemUrl, setImagemUrl] = useState("");
  const [ingredientesSelecionados, setIngredientesSelecionados] = useState<string[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const ingredientesDisponiveis = [
    "pão",
    "carne",
    "queijo",
    "ovo",
    "alface",
    "tomate",
    "cebola",
    "picles",
    "baicon",
    "molho",
    "não",
  ];

  // ==================== FUNÇÕES ====================
  function toggleIngrediente(ingrediente: string) {
    if (ingredientesSelecionados.includes(ingrediente)) {
      setIngredientesSelecionados(
        ingredientesSelecionados.filter(i => i !== ingrediente)
      );
    } else {
      setIngredientesSelecionados([...ingredientesSelecionados, ingrediente]);
    }
  }

  const buscarProdutos = async () => {
    try {
      const res = await axios.get("`${API_URL}/produtos");
      setProdutos(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    buscarProdutos();
  }, []);

  const enviarImagem = async () => {
    if (!imagem) {
      alert("Selecione uma imagem");
      return;
    }

    const formData = new FormData();
    formData.append("imagem", imagem);

    const res = await axios.post("`${API_URL}", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setImagemUrl(`${API_URL}${res.data.imagem}`);
    alert("Imagem enviada!");
  };

  const salvarProduto = async () => {
    if (!imagemUrl) {
      alert("Envie a imagem primeiro");
      return;
    }

    if (!categoria) {
      alert("Selecione a categoria");
      return;
    }

    if (!nome || !preco) {
      alert("Preencha nome e preço");
      return;
    }

    const dadosProduto = {
      nome,
      preco: Number(preco),
      categoria,
      imagem: imagemUrl,
      ingredientes: ingredientesSelecionados,
    };

    try {
      if (editandoId !== null) {
        await axios.put(
          `${API_URL}/produtos/${editandoId}`,
          dadosProduto
        );
        alert("Produto atualizado!");
      } else {
        await axios.post("`${API_URL}/produtos", dadosProduto);
        alert("Produto cadastrado!");
      }

      // Limpar formulário
      setNome("");
      setPreco("");
      setCategoria("");
      setImagem(null);
      setImagemUrl("");
      setEditandoId(null);
      setIngredientesSelecionados([]);

      buscarProdutos();
    } catch (erro) {
      console.error(erro);
      alert("Erro ao salvar produto");
    }
  };

  const excluirProduto = async (id: number) => {
    if (!window.confirm("Excluir produto?")) return;
    await axios.delete(`${API_URL}/produtos/${id}`);
    buscarProdutos();
  };

  const editarProduto = (produto: Produto) => {
    setNome(produto.nome);
    setPreco(String(produto.preco));
    setCategoria(produto.categoria);
    setImagemUrl(produto.imagem);
    setEditandoId(produto.id);

    if (Array.isArray(produto.ingredientes)) {
      setIngredientesSelecionados(produto.ingredientes);
    } else if (typeof produto.ingredientes === "string") {
      setIngredientesSelecionados(produto.ingredientes.split(",").map(i => i.trim()));
    } else {
      setIngredientesSelecionados([]);
    }
  };

  // ==================== JSX ====================
  return (
    <div style={{ minHeight: "100vh", background: "#f3eded", display: "flex", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 1000 }}>
        <h2 style={{ color: "#d62828", marginBottom: 10 }}>🍔 Cadastro de Produtos</h2>
        <Link to="/admin" style={{ color: "#4f4e4e", fontWeight: "bold", textDecoration: "none" }}>
          ⬅ Voltar para pedidos
        </Link>

        {/* FORMULÁRIO */}
        <div style={{ marginTop: 30, background: "#fff", padding: 25, borderRadius: 16, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <input
              placeholder="Nome do produto"
              value={nome}
              onChange={e => setNome(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />

            <input
              placeholder="Preço"
              type="number"
              value={preco}
              onChange={e => setPreco(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />

            <h3>Escolha os ingredientes:</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
              {ingredientesDisponiveis.map(ingrediente => (
                <button
                  key={ingrediente}
                  type="button"
                  onClick={() => toggleIngrediente(ingrediente)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "5px",
                    border: ingredientesSelecionados.includes(ingrediente) ? "2px solid green" : "1px solid gray",
                    backgroundColor: ingredientesSelecionados.includes(ingrediente) ? "#d4ffd4" : "#fff",
                    cursor: "pointer"
                  }}
                >
                  {ingrediente}
                </button>
              ))}
            </div>

            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            >
              <option value="">Selecione categoria</option>
              <option value="Hambúrguer">Hambúrguer</option>
              <option value="Acompanhamentos">Acompanhamentos</option>
              <option value="Bebidas">Bebidas</option>
            </select>

            <input
              type="file"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    setImagem(e.target.files[0]);
  }
}}
            />

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={enviarImagem}
                style={{ background: "#6c757d", color: "#fff", padding: "8px 16px", borderRadius: 8 }}
              >
                Enviar Imagem
              </button>

              <button
                onClick={salvarProduto}
                style={{ background: "#d62828", color: "#fff", padding: "10px 20px", borderRadius: 10 }}
              >
                {editandoId ? "Atualizar Produto" : "Cadastrar Produto"}
              </button>
            </div>
          </div>
        </div>

        {/* LISTA DE PRODUTOS */}
        <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          {produtos.map(prod => {
            let ingredientesLista: string[] = [];
            if (Array.isArray(prod.ingredientes)) ingredientesLista = prod.ingredientes;
            if (typeof prod.ingredientes === "string") ingredientesLista = prod.ingredientes.split(",").map(i => i.trim());

            return (
              <div key={prod.id} style={{ background: "#fff", padding: 15, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                <img
  alt={prod.nome}
  src={prod.imagem?.startsWith("http") ? prod.imagem : `http://localhost:3001${prod.imagem}`}
  style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 10, marginBottom: 10 }}
/>
                <strong>{prod.nome}</strong>
                <p style={{ color: "#d62828", fontWeight: "bold" }}>R$ {Number(prod.preco).toFixed(2)}</p>
                <p style={{ fontSize: 13 }}>Categoria: <strong>{prod.categoria || "Não informado"}</strong></p>
                <p style={{ fontSize: 13 }}>Ingredientes: {ingredientesLista.length > 0 ? ingredientesLista.join(", ") : "Não informado"}</p>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    onClick={() => editarProduto(prod)}
                    style={{ background: "#2a9d8f", color: "#fff", padding: "6px 12px", borderRadius: 8 }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => excluirProduto(prod.id)}
                    style={{ background: "#c1121f", color: "#fff", padding: "6px 12px", borderRadius: 8 }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
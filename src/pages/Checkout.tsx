import { useState } from "react";
import axios from "axios";

{/*const API_URL = "https://coroa-burguer-backend-1.onrender.com";*/}
const API_URL = "http://localhost:3001";

type ItemCarrinho = {
  id: number;
  nome: string;
  quantidade: number;
  preco: number;
  ingredientesSelecionados?: string[];
  semCebola?: boolean;
  semTomate?: boolean;
  bacon?: boolean;
  queijoExtra?: boolean;
  extras?: string[];
};

type CheckoutProps = {
  carrinho: ItemCarrinho[];
  limparCarrinho: () => void;
};

export default function Checkout({ carrinho, limparCarrinho }: CheckoutProps) {
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Dinheiro");
  const [enviando, setEnviando] = useState(false);

  const total = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  const finalizarPedido = async () => {
    if (!nome || !endereco || !telefone) {
      alert("Preencha todos os campos!");
      return;
    }

    if (carrinho.length === 0) {
      alert("Carrinho vazio!");
      return;
    }

    setEnviando(true);

    try {
      const itensFormatados = carrinho.map(item => ({
        id: item.id,
        nome: item.nome,
        quantidade: item.quantidade,
        preco: item.preco,
        ingredientes: item.ingredientesSelecionados || [],
        semCebola: item.semCebola || false,
        semTomate: item.semTomate || false,
        bacon: item.bacon || false,
        queijoExtra: item.queijoExtra || false,
        extras: item.extras || [],
      }));

      // Envia para backend
      await axios.post("`${API_URL}/pedidos", {
        total,
        itens: itensFormatados,
        nome_cliente: nome,
        endereco,
        telefone,
        forma_pagamento: formaPagamento,
      });

      // Monta mensagem WhatsApp
      let mensagem = `Pedido:%0A%0ANome: ${nome}%0AEndereço: ${endereco}%0ATelefone: ${telefone}%0APagamento: ${formaPagamento}%0A%0A`;
      carrinho.forEach(item => {
        mensagem += `- ${item.nome} x${item.quantidade}%0A`;
        if (item.ingredientesSelecionados?.length)
          mensagem += `Ingredientes: ${item.ingredientesSelecionados.join(", ")}%0A`;
        if (item.semCebola) mensagem += `Sem cebola%0A`;
        if (item.semTomate) mensagem += `Sem tomate%0A`;
        if (item.bacon) mensagem += `Com bacon%0A`;
        if (item.queijoExtra) mensagem += `Queijo extra%0A`;
        if (item.extras?.length) mensagem += `Extras: ${item.extras.join(", ")}%0A`;
        mensagem += `%0A`;
      });
      mensagem += `Total: R$ ${total.toFixed(2)}`;

      window.open(`https://wa.me/5592985178710?text=${mensagem}`);

      alert("Pedido enviado com sucesso!");
      limparCarrinho();
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar pedido.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "auto" }}>
      <h2>Finalizar Pedido</h2>

      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Endereço"
        value={endereco}
        onChange={(e) => setEndereco(e.target.value)}
        style={inputStyle}
      />
      <input
        type="tel"
        placeholder="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        style={inputStyle}
      />
      <select
        value={formaPagamento}
        onChange={(e) => setFormaPagamento(e.target.value)}
        style={inputStyle}
      >
        <option value="Dinheiro">Dinheiro</option>
        <option value="Cartão">Cartão</option>
        <option value="PIX">PIX</option>
      </select>

      <p><b>Total: R$ {total.toFixed(2)}</b></p>

      <button
        onClick={finalizarPedido}
        disabled={enviando}
        style={{ ...botao, background: "#25D366" }}
      >
        {enviando ? "Enviando..." : "Finalizar Pedido"}
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 8,
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const botao = {
  width: "100%",
  padding: 10,
  border: "none",
  borderRadius: 6,
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};
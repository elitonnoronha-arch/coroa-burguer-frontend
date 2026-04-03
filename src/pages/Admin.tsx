import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { io } from "socket.io-client"
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

type Pedido = {
  id: number
  total: number
  status: string
  itens: any[] | string
  criado_em: string
}



export default function Admin() {

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [alerta, setAlerta] = useState<any>(null)
  const [, atualizarTempo] = useState(0)
  const socketRef = useRef<any>(null)

  const navigate = useNavigate();

const irParaProdutos = () => {
  navigate("/admin/produtos"); // Caminho da página de produtos
};

  const fecharLoja = async () => {
    await axios.post("http://localhost:3001/loja-status", {
      aberto: false
    })
    alert("Loja fechada")
  }

  const abrirLoja = async () => {
    await axios.post("http://localhost:3001/loja-status", {
      aberto: true
    })
    alert("Loja aberta")
  }

  const tocarSom = () => {
    const audio = new Audio("/notificacao.mp3")
    audio.play().catch(() => {})
  }

  const carregarPedidos = async () => {
    try {
      const res = await axios.get("http://localhost:3001/pedidos")
      setPedidos(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {

    carregarPedidos()

    socketRef.current = io("http://localhost:3001")

    socketRef.current.on("novo-pedido", (pedido: Pedido) => {

      tocarSom()

      setPedidos(prev => [pedido, ...prev])

      setAlerta(pedido)

      setTimeout(() => {
        setAlerta(null)
      }, 5000)

    })

    

    return () => {
      socketRef.current?.disconnect()
    }

  }, [])

  useEffect(() => {

    const intervalo = setInterval(() => {
      atualizarTempo(v => v + 1)
    }, 1000)

    return () => clearInterval(intervalo)

  }, [])

  const mensagemStatus = (pedido:any, status:string) => {

  const nome = pedido.nome || pedido.cliente?.nome || "";
  
  let mensagem = `🍔 *Coroa Burguer*%0A%0A`;

  mensagem += `Olá ${nome}!%0A%0A`;

  if (status === "PREPARANDO") {
    mensagem += `👨‍🍳 Seu pedido está sendo preparado!`;
  }

  if (status === "SAIU") {
    mensagem += `🛵 Seu pedido saiu para entrega!`;
  }

  if (status === "CONCLUIDO") {
    mensagem += `✅ Pedido entregue! Obrigado pela preferência!`;
  }

  mensagem += `%0A%0A💛 Agradecemos seu pedido!`;

  return mensagem;
};

  const atualizarStatus = async (id: number, status: string) => {

  await axios.put(`http://localhost:3001/pedidos/${id}/status`, { status })

  const pedido = pedidos.find(p => p.id === id);

  if (pedido) {
    const telefone = (pedido as any).telefone || (pedido as any).cliente?.telefone;

    if (telefone) {
      const telefoneLimpo = telefone.replace(/\D/g, "");

      const msg = mensagemStatus(pedido, status);

      window.open(`https://wa.me/55${telefoneLimpo}?text=${msg}`, "_blank");
    }
  }

  carregarPedidos()

}

  const excluirPedido = async (id: number) => {

    await axios.delete(`http://localhost:3001/pedidos/${id}`)

    setPedidos(prev => prev.filter(p => p.id !== id))

  }

  const novos = pedidos.filter(p => p.status === "NOVO")
  const preparando = pedidos.filter(p => p.status === "PREPARANDO")
  const saiu = pedidos.filter(p => p.status === "SAIU")
  const concluido = pedidos.filter(p => p.status === "CONCLUIDO")

  const total = pedidos.reduce((a, b) => a + Number(b.total), 0)

  return (
  <div style={{
background:"#f4f6f9",
minHeight:"100vh",
display:"flex",
justifyContent:"center"
}}>

<div style={{
width:"100%",
maxWidth:1100,
padding:20
}}>

<h1 style={{ textAlign:"center",/*display:"flex",*/padding:10, }}>
 Painel de Pedidos
</h1>

<Link to="/precificacao" style={{
  display: "inline-block",
  marginTop: 20,
  padding: "10px 15px",
  background: "#2a9d8f",
  color: "#fff",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: "bold"
}}>
  💰 Precificação
</Link>




<div style={{
marginBottom:"20px",
display:"flex",
gap:"10px"
}}>

{/*ABRIR LOJA*/}

<button
onClick={abrirLoja}
style={{
background:"#2ecc71",
color:"#fff",
border:"none",
padding:"8px 15px",
borderRadius:"6px",
cursor:"pointer",
fontWeight:"bold",

}}
>

  
🟢 Abrir Loja
</button>

{/*FECHAR LOJA*/}

<button
onClick={fecharLoja}
style={{
background:"#e63946",
color:"#fff",
border:"none",
padding:"8px 15px",
borderRadius:"6px",
cursor:"pointer",
fontWeight:"bold"
}}
>



🔴 Fechar Loja
</button>

</div>

{/*IR PARA PRODUTOS*/}
<button
  onClick={irParaProdutos}
  style={{
    background: "#3498db",
    color: "#fff",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    marginLeft:0,
    marginBottom:20,
    
  }}
>
    {/*CADASTRO DE PRODUTOS*/}

  Cadastrar Produtos ➡ 
</button>


<div style={{
display:"flex",
justifyContent:"center",
gap:20,
marginBottom:20,


}}>

  

<CardTop titulo="📦 Pedidos hoje" valor={pedidos.length} />
<CardTop titulo="💰 Total vendido" valor={`R$ ${total.toFixed(2)}`} />
<CardTop titulo="⭐ Mais Vendido" valor="X-Burger" />

</div>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",
gap:20
}}>

<Coluna
titulo="⏱ Novos"
cor="#e63946"
pedidos={novos}
acao={(id:number)=>atualizarStatus(id,"PREPARANDO")}
texto="PREPARAR"
/>

<Coluna
titulo="🍔 Preparando"
cor="#457b9d"
pedidos={preparando}
acao={(id:number)=>atualizarStatus(id,"SAIU")}
texto="SAIU"
/>

<Coluna
titulo="🛵 Saiu"
cor="#6a4c93"
pedidos={saiu}
acao={(id:number)=>atualizarStatus(id,"CONCLUIDO")}
texto="CONCLUIR"
/>

<Coluna
titulo="✅ Concluído"
cor="#2a9d8f"
pedidos={concluido}
excluirPedido={excluirPedido}
/>

</div>

{alerta && <Alerta pedido={alerta} />}

</div>


</div>


)

}

function CardTop({titulo,valor}:{titulo:string,valor:any}){

  
return(

<div style={{
background:"#fff",
padding:15,
borderRadius:10,
boxShadow:"0 2px 8px rgba(0,0,0,0.1)",
minWidth:200,
textAlign:"center"
}}>

<b>{titulo}</b>
<h2>{valor}</h2>

</div>

)

}

function Coluna({
titulo,
cor,
pedidos,
acao,
texto,
excluirPedido
}:{
titulo:string
cor:string
pedidos:any[]
acao?:Function
texto?:string
excluirPedido?:Function
}){

function tempoPedido(data:string){

  

const inicio=new Date(data).getTime()
const agora=new Date().getTime()

const diff=Math.floor((agora-inicio)/1000)

const min=Math.floor(diff/60)
const seg=diff%60

return `${min}:${seg.toString().padStart(2,"0")}`

}

const gerarMensagemWhatsApp = (pedido:any) => {

  const itens =
    typeof pedido.itens === "string"
      ? JSON.parse(pedido.itens)
      : pedido.itens || [];

  // 🔥 PEGA DADOS DE QUALQUER FORMATO
  const nome = pedido.nome || pedido.cliente?.nome || "";
  const telefone = pedido.telefone || pedido.cliente?.telefone || "";
  const endereco = pedido.endereco || pedido.cliente?.endereco || "";
  const pagamento = pedido.forma_pagamento || pedido.formaPagamento || pedido.cliente?.formaPagamento || "";

  let mensagem = `*Pedido*%0A%0A`;

  mensagem += `Nome: ${nome}%0A`;
  mensagem += `Telefone: ${telefone}%0A`;
  mensagem += `Endereço: ${endereco}%0A`;
  mensagem += `Pagamento: ${pagamento}%0A%0A`;

  itens.forEach((item:any) => {
    mensagem += `🍔 ${item.nome} x${item.quantidade}%0A`;

    let ingredientesFinal = "";

// 🔹 Ingredientes selecionados (prioridade)
if (Array.isArray(item.ingredientesSelecionados)) {
  ingredientesFinal = item.ingredientesSelecionados.join(", ");
}

// 🔹 Se não tiver, tenta pegar os padrão
else if (item.ingredientes) {
  try {
    if (typeof item.ingredientes === "string") {
      if (item.ingredientes.startsWith("[")) {
        ingredientesFinal = JSON.parse(item.ingredientes).join(", ");
      } else {
        ingredientesFinal = item.ingredientes;
      }
    } else if (Array.isArray(item.ingredientes)) {
      ingredientesFinal = item.ingredientes.join(", ");
    }
  } catch {
    ingredientesFinal = "";
  }
}

    if (ingredientesFinal) {
  mensagem += `Ingredientes: ${ingredientesFinal}%0A`;
}

    mensagem += `R$ ${(Number(item.preco) * item.quantidade).toFixed(2)}%0A%0A`;
  });

  mensagem += `*Total: R$ ${Number(pedido.total).toFixed(2)}*`;

  return mensagem;
};



return(

<div style={{background:"#fff",borderRadius:10,padding:10}}>

<div style={{
background:cor,
color:"#fff",
padding:10,
borderRadius:8,
fontWeight:"bold"
}}>
{titulo} ({pedidos.length})
</div>

{pedidos.map((pedido:any)=>{
  console.log("PEDIDO COMPLETO:", pedido) // 👈 AQUI
  console.log(pedido)

const itens=
typeof pedido.itens==="string"
?JSON.parse(pedido.itens)
:pedido.itens||[]

return(

<div key={pedido.id}
style={{
background:"#f1f1f1",
padding:10,
marginTop:10,
borderRadius:10
}}>

<b>Pedido #{pedido.id}</b>

<div style={{ fontSize: 13, marginTop: 5 }}>

  <p style={{ margin: 0 }}>
    👤 {pedido.nome || pedido.cliente?.nome}
  </p>

  <p style={{ margin: 0 }}>
    📞 {pedido.telefone || pedido.cliente?.telefone}
  </p>

  <p style={{ margin: 0 }}>
    📍 {pedido.endereco || pedido.cliente?.endereco}
  </p>

  <p style={{ margin: 0 }}>
    💳 {pedido.forma_pagamento || pedido.formaPagamento || pedido.cliente?.formaPagamento}
  </p>

</div>


<div style={{fontSize:12,color:"#666",marginBottom:5}}>
⏱ {tempoPedido(pedido.criado_em)}
</div>

{itens.map((item:any,i:number)=>{
  console.log("ITEM:", item)

// LISTA DE INGRDIENTES//
const ingredientesLista = (() => {
  if (!item.ingredientes) return [];

  try {
    if (typeof item.ingredientes === "string") {
      // 👉 se for JSON
      if (item.ingredientes.startsWith("[")) {
        return JSON.parse(item.ingredientes);
      }

      // 👉 se for texto simples (pão,carne)
      return item.ingredientes.split(",");
    }

    // 👉 se já for array
    return item.ingredientes;
  } catch {
    return [];
  }
})();




const selecionados=Array.isArray(item.ingredientesSelecionados)
?item.ingredientesSelecionados.join(", ")
:item.ingredientesSelecionados||""

const extras = Array.isArray(item.extras)
? item.extras.join(", ")
: item.extras || ""



return(

  

<div key={i} style={{marginBottom:5}}>

<p style={{margin:0,fontWeight:"bold"}}>
🍔 {item.nome} x{item.quantidade}
</p>





{ingredientesLista.length > 0 && (
<div style={{
display:"flex",
flexWrap:"wrap",
gap:"4px",
marginTop:"3px"
}}>
{ingredientesLista.map((ing:any,index:number)=>(
<span
key={index}
style={{
background:"#ffd6d6",
padding:"2px 6px",
borderRadius:"6px",
fontSize:"11px"
}}
>
{ing}
</span>
))}
</div>
)} 

{selecionados && (
<p style={{fontSize:12,color:"#e63946",margin:0}}>
Ingredientes escolhidos: {selecionados}
</p>
)}

{extras && (
<p style={{fontSize:12,color:"#2a9d8f",margin:0}}>
Extras: {extras}
</p>
)}

</div>

)

})}

<p><b>R$ {Number(pedido.total).toFixed(2)}</b></p>

<div style={{
display:"flex",
gap:5,
flexWrap:"wrap"
}}>

{acao && (
<button
onClick={()=>acao(pedido.id)}
style={botao(cor)}
>
{texto}
</button>
)}

{excluirPedido && (
<button
onClick={()=>excluirPedido(pedido.id)}
style={botao("#c1121f")}
>
Excluir
</button>
)}

{/* BOTÃO CLIENTE */}
<button
onClick={() => {
  const msg = gerarMensagemWhatsApp(pedido);

  const telefone = pedido.telefone;

  if (!telefone) {
    alert("Cliente sem telefone");
    return;
  }

  const telefoneLimpo = telefone.replace(/\D/g, "");

  window.open(`https://wa.me/55${telefoneLimpo}?text=${msg}`, "_blank");
}}
style={botao("#25D366")}
>
Cliente
</button>

{/* BOTÃO SEU WHATS */}
<button
onClick={() => {
  const msg = gerarMensagemWhatsApp(pedido);

  window.open(`https://wa.me/5592985178710?text=${msg}`, "_blank");
}}
style={botao("#128C7E")}
>
Meu Whats
</button>

<button
onClick={()=>imprimirPedido(pedido)}
style={botao("#333")}
>
🖨 Imprimir
</button>

</div>

</div>

)
 

})}

</div>

)

}

function Alerta({pedido}:{pedido:any}){

const itens=
typeof pedido.itens==="string"
?JSON.parse(pedido.itens)
:pedido.itens||[]

return(

<div style={{

position:"fixed",
top:"50%",
left:"50%",
transform:"translate(-50%,-50%)",
background:"#e63946",
color:"#fff",
padding:30,
borderRadius:10,
boxShadow:"0 0 20px rgba(0,0,0,0.3)",
textAlign:"center",
zIndex:999

}}>

<h1>🔔 Novo Pedido Recebido!</h1>

<h2>Pedido #{pedido.id}</h2>

{itens.map((item:any,i:number)=>{
  console.log("ITEM COMPLETO:", item)

   console.log(item) // 👈 COLOCA AQUI

const ingredientes=Array.isArray(item.ingredientes)
?item.ingredientes.join(", ")
:item.ingredientes||""

const extras = Array.isArray(item.extras)
? item.extras.join(", ")
: item.extras || ""



return(

<div key={i}>

<p style={{margin:0}}>• {item.nome}</p>

{ingredientes && (
<p style={{fontSize:12,margin:0}}>
Ingredientes: {ingredientes}
</p>
)}

{extras && (
<p style={{fontSize:12,margin:0}}>
Extras: {extras}
</p>
)}

</div>

)

})}

<h2>R$ {Number(pedido.total).toFixed(2)}</h2>

<a
href={`https://wa.me/?text=Pedido%20${pedido.id}`}
target="_blank"
>

<button style={botao("#25D366")}>
Enviar WhatsApp
</button>

</a>

</div>

)

}

function imprimirPedido(pedido:any){

const itens =
typeof pedido.itens === "string"
? JSON.parse(pedido.itens)
: pedido.itens || [];

// 🔥 DADOS DO CLIENTE
const nome = pedido.nome || pedido.cliente?.nome || "";
const telefone = pedido.telefone || pedido.cliente?.telefone || "";
const endereco = pedido.endereco || pedido.cliente?.endereco || "";
const pagamento = pedido.forma_pagamento || pedido.formaPagamento || pedido.cliente?.formaPagamento || "";

// 🔥 TEXTO PRA QR CODE
const resumo = encodeURIComponent(
  `Pedido #${pedido.id} - ${nome} - Total R$ ${pedido.total}`
);

// 🔥 HTML COMPLETO
let conteudo = `
<html>
<head>
<meta charset="UTF-8">
<style>
  body {
    font-family: monospace;
    width: 280px;
    margin: 0 auto;
    padding: 10px;
  }

  h2, h3, p {
    margin: 4px 0;
  }

  .center {
    text-align: center;
  }

  .linha {
    border-top: 1px dashed #000;
    margin: 8px 0;
  }

  .item {
    margin-bottom: 8px;
  }

  .total {
    font-size: 16px;
    font-weight: bold;
  }

  .extra {
    font-size: 12px;
    color: #000;
  }

  .destaque {
    font-weight: bold;
    color: #000;
  }

  .corte {
    margin-top: 15px;
    border-top: 2px dashed #000;
    text-align: center;
    font-size: 10px;
  }
    
</style>
</head>

<body>

  <div class="center">
  <h2>🍔 Coroa Burguer</h2>
    <p>Pedido #${pedido.id}</p>
  </div>

  <div class="linha"></div>

  <p><b>Cliente:</b> ${nome}</p>
  <p><b>Tel:</b> ${telefone}</p>
  <p><b>End:</b> ${endereco}</p>
  <p><b>Pgto:</b> ${pagamento}</p>

  <div class="linha"></div>
`;

// 🔥 ITENS
itens.forEach((item:any) => {

  let ingredientes = "";

  if (Array.isArray(item.ingredientesSelecionados)) {
    ingredientes = item.ingredientesSelecionados.join(", ");
  }

  // 🔥 DETECTAR EXTRAS / REMOÇÕES
  const extras = [];

  if (item.bacon) extras.push("🥓 EXTRA BACON");
  if (item.queijoExtra) extras.push("🧀 EXTRA QUEIJO");
  if (item.semCebola) extras.push("🚫 SEM CEBOLA");
  if (item.semTomate) extras.push("🚫 SEM TOMATE");

  conteudo += `
    <div class="item">
      <p class="destaque">${item.nome}</p>
      <p>Qtd: ${item.quantidade}</p>
  `;

  if (ingredientes) {
    conteudo += `<p class="extra">+ ${ingredientes}</p>`;
  }

  if (extras.length > 0) {
    conteudo += `<p class="extra">${extras.join(" | ")}</p>`;
  }

  conteudo += `</div>`;
});

// 🔥 TOTAL + QR CODE
conteudo += `
  <div class="linha"></div>

  <p class="total">Total: R$ ${Number(pedido.total).toFixed(2)}</p>

  <div class="linha"></div>

  <div class="center">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${resumo}" />
  </div>

  <p class="center">Obrigado pela preferência ❤️</p>
  <p class="center">Volte sempre!</p>

  <div class="corte">✂ Corte aqui ✂</div>

</body>
</html>
`;

// 🔥 IMPRIMIR
const janela:any = window.open("", "PRINT", "height=600,width=400");

janela.document.write(conteudo);
janela.document.close();
janela.print();

}




function botao(cor:string){

return{

background:cor,
color:"#fff",
border:"none",
padding:"3px 6px",
borderRadius:5,
cursor:"pointer",
fontSize:11,
lineHeight:"14px",
whiteSpace:"nowrap"

}

}
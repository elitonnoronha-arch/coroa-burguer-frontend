import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Routes, Route, Link } from "react-router-dom";
import Admin from "./pages/Admin";
import ProdutosAdmin from "./pages/ProdutosAdmin";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Precificacao from "./pages/Precificacao";
import Visitas from "./pages/Visitas";
import Dashboard from "./pages/Dashboard"


const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://coroa-burguer-backend-1.onrender.com";

type ItemCarrinho = {
  id: number;
  nome: string;
  preco: number;
  imagem: string;
  quantidade: number;
  ingredientes?: string[];
  ingredientesSelecionados?: string[];
  semCebola?: boolean;
  semTomate?: boolean;
  bacon?: boolean;
  queijoExtra?: boolean;
};

type Produto = {
  id: number;
  nome: string;
  preco: number;
  preco_antigo?: number;
  imagem: string;
  categoria: string;
  ingredientes?: string[];
  avaliacao?: number;
};

//FUNÇAO LOJA//

function Loja() {
  const visitanteIdRef = useRef<string | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [animarCarrinho, setAnimarCarrinho] = useState(false);
  const [abrirCarrinho, setAbrirCarrinho] = useState(false);
  const [lojaAberta, setLojaAberta] = useState(true);
  /*const [categoriaSelecionada] = useState("Todos");*/
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");
  const [nomeCliente, setNomeCliente] = useState("");
const [endereco, setEndereco] = useState("");
const [telefone, setTelefone] = useState("");
const [formaPagamento, setFormaPagamento] = useState("");


 const categorias = [
  "Hambúrguer",
  "Acompanhamentos",
  "Bebidas",
];

const carrinhoBoxRef = useRef<HTMLDivElement>(null);
const [alturaCarrinho, setAlturaCarrinho] = useState(0);
  const carrinhoRef = useRef<ItemCarrinho[]>([]);

  const tocarNotificacao = () => {
    const audio = new Audio("/notificacao.mp3");
    audio.play().catch(() => {});
  };

  useEffect(() => {
  const buscarStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/loja-status`)
      setLojaAberta(res.data.loja_aberta)
    } catch (err) {
      console.error(err)
    }
  }

  buscarStatus()

  const interval = setInterval(buscarStatus, 3000)

  return () => clearInterval(interval)
}, [])

  useEffect(() => {
    if (carrinhoRef.current.length > carrinho.length) {
      tocarNotificacao();
    }
    carrinhoRef.current = carrinho;
  }, [carrinho]);

  useEffect(() => {
    axios
      .get(`${API_URL}/produtos`)
      .then(res => setProdutos(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
  // visitante entrou
  axios.post(`${API_URL}/visita/inicio`)
    .then(res => {
      visitanteIdRef.current = res.data.id;
      console.log("VISITA:", visitanteIdRef.current);
    });

  // visitante saiu
  const sair = () => {
    if (visitanteIdRef.current) {
      navigator.sendBeacon(
        `${API_URL}/visita/fim`,
        JSON.stringify({ id: visitanteIdRef.current })
      );
    }
  };

  window.addEventListener("beforeunload", sair);

  return () => {
    window.removeEventListener("beforeunload", sair);
  };
}, []);

  useEffect(() => {
    const verificarStatus = () => {
      axios
        .get(`${API_URL}/loja-status`)
        .then(res => setLojaAberta(res.data.loja_aberta))
        .catch(err => console.error(err));
    };
    verificarStatus();
    const intervalo = setInterval(verificarStatus, 5000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
  if (carrinhoBoxRef.current) {
    setAlturaCarrinho(carrinhoBoxRef.current.offsetHeight);
  }
}, [carrinho, abrirCarrinho]);

useEffect(() => {
  let visitanteId: string;

  // 🔥 visitante entrou
  axios.post(`${API_URL}/visita/inicio`)
    .then(res => {
      visitanteId = res.data.id;
      console.log("VISITA INICIADA:", visitanteId); // 👈 importante
    });
      
  // 🔥 quando sair
  const sair = () => {
    if (visitanteId) {
      navigator.sendBeacon(
        `${API_URL}/visita/fim`,
        JSON.stringify({ id: visitanteId })
      );
    }
  };

  window.addEventListener("beforeunload", sair);

  return () => {
    window.removeEventListener("beforeunload", sair);
  };
}, []);

useEffect(() => {

  const enviarPing = async () => {
    await fetch(`${API_URL}/visitas/ping`, {
      method: "POST"
    })
  }

  enviarPing()

  const intervalo = setInterval(enviarPing, 5000)

  return () => clearInterval(intervalo)

}, [])



  const adicionarCarrinho = (produto: Produto) => {
    setCarrinho(prev => {
      const existe = prev.find(p => p.id === produto.id);
      if (existe) {
        return prev.map(p =>
          p.id === produto.id
            ? { ...p, quantidade: p.quantidade + 1 }
            : p
        );
      }

     

      return [
        ...prev,
        {
          ...produto,
          quantidade: 1,
          semCebola: false,
          semTomate: false,
          bacon: false,
          queijoExtra: false,
          ingredientesSelecionados: Array.isArray(produto.ingredientes)
  ? produto.ingredientes.filter(i => i !== null && i !== "")
  : [],
        },
      ];
    });

    setAnimarCarrinho(true);
    setTimeout(() => setAnimarCarrinho(false), 400);
  };

  const aumentarQuantidade = (id:number) => {
  setCarrinho(prev =>
    prev.map(item =>
      item.id === id
        ? { ...item, quantidade: item.quantidade + 1 }
        : item
    )
  );
};

const diminuirQuantidade = (id:number) => {
  setCarrinho(prev =>
    prev
      .map(item =>
        item.id === id
          ? { ...item, quantidade: item.quantidade - 1 }
          : item
      )
      .filter(item => item.quantidade > 0)
  );
};

const removerItem = (id:number) => {
  const confirmar = confirm("Deseja remover este item?");
  
  if (!confirmar) return;

  setCarrinho(prev => prev.filter(item => item.id !== id));
};

// 🔥 ADICIONAR/REMOVER INGREDIENTE
const toggleIngrediente = (id:number, ingrediente:string) => {
  setCarrinho(prev =>
    prev.map(item => {
      if (item.id !== id) return item;

      const lista = item.ingredientesSelecionados || [];

      const existe = lista.includes(ingrediente);

      return {
        ...item,
        ingredientesSelecionados: existe
          ? lista.filter(i => i !== ingrediente)
          : [...lista, ingrediente]
      };
    })
  );
};

  const total = carrinho.reduce(
    (soma, item) => soma + Number(item.preco) * item.quantidade,
    0
  );

  

 const finalizarPedido = async () => {
  if (carrinho.length === 0) {
    alert("Carrinho vazio");
    return;
  }

  

  // 🔴 VALIDAÇÃO (ESSENCIAL)
  if (!nomeCliente || !telefone) {
    alert("Preencha nome e telefone");
    return;
  }

  try {
    const status = await axios.get(`${API_URL}/loja-status`);

    if (!status.data.loja_aberta) {
      alert("Estamos fechados no momento");
      return;
    }

    const itensFormatados = carrinho.map(item => ({
  nome: item.nome,
  quantidade: item.quantidade,
  preco: item.preco,
  ingredientesSelecionados: Array.isArray(item.ingredientesSelecionados)
    ? item.ingredientesSelecionados
    : []
}));
         console.log({
  nomeCliente,
  telefone,
  endereco,
  formaPagamento
});
    // ✅ ENVIA CORRETO PRO BACKEND
    await axios.post(`${API_URL}/pedidos`, {
      total,
      itens: itensFormatados,
      cliente: {
  nome: nomeCliente || "",
  endereco: endereco || "",
  telefone: telefone || "",
  formaPagamento: formaPagamento || "",
},
    });

    // ✅ MENSAGEM WHATSAPP CORRIGIDA
    let mensagem = `*Pedido*%0A%0A`;

    mensagem += `Nome: ${nomeCliente}%0A`;
    mensagem += `Telefone: ${telefone}%0A`;
    mensagem += `Endereço: ${endereco}%0A`;
    mensagem += `Pagamento: ${formaPagamento}%0A%0A`;

    carrinho.forEach(item => {
  mensagem += `🍔 ${item.nome} x${item.quantidade}%0A`;

  const ingredientes = Array.isArray(item.ingredientesSelecionados)
    ? item.ingredientesSelecionados.join(", ")
    : "";

  if (ingredientes) {
    mensagem += `Ingredientes: ${ingredientes}%0A`;
  }

  mensagem += `R$ ${(Number(item.preco) * item.quantidade).toFixed(2)}%0A%0A`;
});

    mensagem += `*Total: R$ ${total.toFixed(2)}*`;

    // 🔥 ABRIR WHATSAPP
    window.open(`https://wa.me/5592985178710?text=${mensagem}`, "_blank");

    setCarrinho([]);
    alert("Pedido enviado com sucesso!");

  } catch (error) {
    console.error(error);
    alert("Erro ao finalizar pedido");
  }
};
    //pagarOnline
    
const pagarOnline = async () => {
  if (carrinho.length === 0) {
    alert("Carrinho vazio");
    return;
  }

  try {
    // 🔥 1. CRIA PEDIDO PRIMEIRO
    const resPedido = await axios.post(`${API_URL}/pedidos`, {
      total,
      itens: carrinho,
      cliente: {
        nome: nomeCliente,
        telefone,
        endereco,
        formaPagamento
      }
    });

    const pedido_id = resPedido.data.id;

    // 🔥 2. CRIA PAGAMENTO COM ESSE ID
    const resPagamento = await axios.post(`${API_URL}/criar-pagamento`, {
      itens: carrinho,
      total,
      email: "test_user_xxx@testuser.com", // usa seu teste
      pedido_id // 🔥 ESSENCIAL
    });

    // 🔥 3. REDIRECIONA
    window.location.href = resPagamento.data.link;

  } catch (error) {
    console.error(error);
    alert("Erro ao pagar");
  }
};

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#fff5f5", minHeight: "100vh", width: "100%", display: "flex", justifyContent: "center" }}>

     {!lojaAberta && (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999
  }}>
  
    <div style={{
      background: "#fff",
      padding: "30px",
      borderRadius: "16px",
      textAlign: "center",
      width: "90%",
      maxWidth: "350px",
     /* maxHeight: "350px",*/
      boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
      animation: "fadeIn 0.3s ease"
    }}>
      <img src="/logo.png" alt="logo" style={{height:80, marginLeft:"37%", marginBottom:"5px"}}/>
      <h2 style={{ color: "#d62828", marginBottom: 10 }}>
        🚫 Loja Fechada
      </h2>

      <p style={{ fontSize: 16, marginBottom: 10 }}>
        Estamos fechados no momento
      </p>

      <p style={{ fontSize: 14, color: "#555" }}>
        ⏰ Abriremos em breve! {/*Voltaremos amanhã!*/}
      </p>

    </div>

  </div>
)}

      <div style={{ width: "100%", maxWidth: 1100 }}>

            

        {/* HEADER */}
        <div style={{
          background:"#d62828",
          padding:"15px",
          color:"#fff",
          fontSize:24,
          fontWeight:"bold",
          position:"sticky",
          top:0,
          zIndex:10,
          boxShadow:"0 4px 10px rgba(0,0,0,0.2)",
          borderBottomLeftRadius:12,
          borderBottomRightRadius:12,
          display:"flex",
          alignItems:"center",
          justifyContent:"space-between"
        }}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src="/logo.png" alt="logo" style={{height:50}}/>
            <span>Coroa Burger</span>
            <div style={{ fontSize:12, marginTop:4, color:"#fff" }}>
              {lojaAberta ? "🟢 Loja aberta" : "🔴 Loja fechada"}
            </div>
          </div>

          <div
            onClick={()=>setAbrirCarrinho(!abrirCarrinho)}
            style={{
              position:"relative",
              fontSize:22,
              cursor:"pointer",
              transform:animarCarrinho?"scale(1.3)":"scale(1)",
              transition:"0.3s"
            }}
          >
            🛒 
            {carrinho.length>0 && (
              <span style={{
                position:"absolute",
                top:-8,
                right:-10,
                background:"#fff",
                color:"#d62828",
                borderRadius:"50%",
                fontSize:12,
                padding:"2px 6px",
                fontWeight:"bold"
              }}>
                {carrinho.reduce((t,i)=>t+i.quantidade,0)}
              </span>
            )}
          </div>
        </div>
        
        <div style={{textAlign:"right",marginBottom:25, marginTop:10 }}>
 <Link to="/admin" style={{
  fontSize:14,
  color:"#d62828",
  fontWeight:"bold",
  textDecoration:"none",
  marginTop:"50" 
  
  }}>
  Admin&#128274;
  </Link>
 </div>

 

        <div style={{padding:20,paddingBottom:220}}>

{/*BANNER TOPO*/}

          <div style={{
  margin:"-70px 0 20px 0",
  borderRadius:5,
  overflow:"hidden",
  boxShadow:"0 6px 20px rgba(0,0,0,0.2)"
}}>
  <img
    src="/banner.jpeg"
    alt="promo"
    style={{
      width:"100%",
      height:30,   /*180 */
      objectFit:"cover"
    }}
  />
</div>

{/*CRIAR MENU DE CATEGORIAS*/} 
<div style={{
  display:"flex",
  gap:10,
  overflowX:"auto",
  marginBottom:20
}}>
  
  {categorias.map(cat => (
    
    <button
      key={cat}
      onClick={() => setCategoriaSelecionada(cat)}
      style={{
        padding:"8px 14px",
        borderRadius:20,
        border:"none",
        cursor:"pointer",
        fontWeight:"bold",
        background: categoriaSelecionada === cat ? "#d62828" : "#e4e4e4",
        color: categoriaSelecionada === cat ? "#fff" : "#333"
      }}
    >
      {cat}
    </button>

  ))}

</div>



{/* PRODUTOS */}
  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:20 }}>
            {produtos
  .filter(prod => categoriaSelecionada==="Todos" || prod.categoria===categoriaSelecionada)
  .map(prod => {

    console.log("PRODUTO:", prod)

    return (
  <div key={prod.id} style={{
    background:"#fff",
    borderRadius:16,
    overflow:"hidden",
    boxShadow:"0 6px 18px rgba(0,0,0,0.15)",
    border:"1px solid #eee"
  }}>
      {/* IMAGENS DO CARDAPIO */}
    <img
      src={prod.imagem?.startsWith("http")
        ? prod.imagem
        : `${API_URL}${prod.imagem}`}
      alt={prod.nome}
      style={{
        width:"100%",
        height:170,
        padding:8,
        borderRadius:16,
        objectFit:"cover"
      }}
    />

    <div style={{padding:15}}>
      <h3 style={{marginBottom:8}}>{prod.nome}</h3>
      
             {/* INGREDIENTES DO PRODUTO */}
      <p>
        Ingredientes: {
          Array.isArray(prod.ingredientes)
            ? prod.ingredientes.join(", ")
            : "Não informado"
        }
      </p>
           {/* PREÇO DO PRODUTO */}
      <p style={{
        fontWeight:"bold",
        color:"#d62828",
        fontSize:16,
        marginBottom:10
      }}>
        R$ {Number(prod.preco).toFixed(2)}
      </p>

      <button
        onClick={() => adicionarCarrinho(prod)}
        style={{
          background:"#d62828",
          color:"#fff",
          border:"none",
          padding:"8px 12px",
          borderRadius:8,
          cursor:"pointer",
          width:"100%",
          fontWeight:"bold"
        }}
      >
        Adicionar 🛒
      </button>
    </div>

  </div>
)
  })}
          </div>

         
          {/* CARRINHO */}
          
           
        {/* CARRINHO PROFISSIONAL */}
<div
  ref={carrinhoBoxRef}
  style={{
  position:"fixed",
  right:20,
  bottom:5,
  width:320,
  background:"#ffffff",
  borderRadius:16,
  padding:"7px 15px 15px 15px",
  boxSizing:"border-box",
  boxShadow:"0 15px 40px rgba(0,0,0,0.3)",
  display:"flex",
  flexDirection:"column",
  maxHeight:"83vh",
  overflow:"hidden", // mantém
  cursor:"pointer",
  

  // 👇 ANIMAÇÃO
  transform: abrirCarrinho
  ? "translateY(0)"
  : `translateY(${alturaCarrinho - 70}px)`,
  /*opacity: abrirCarrinho ? 1 : 0,*/
  transition:"all 0.3s ease"
}}>

  <div
  onClick={() => setAbrirCarrinho(!abrirCarrinho)}
  style={{
    
    height:60, // 👈 MUITO IMPORTANTE
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    color:"#d62828",
    fontWeight:"bold",
    cursor:"pointer",
    borderBottom:"1px solid #eee",
    
    
    
  }}
>
  <h2>🛒 Carrinho</h2> {abrirCarrinho ? "⬇" : "⬆"}
</div>

  {/* FORMULÁRIO */}
  <input
  placeholder="Seu nome"
  value={nomeCliente}
  onChange={(e) => setNomeCliente(e.target.value)}
  style={{
    padding:8,
    marginTop:8,
    marginBottom:6,
    borderRadius:6,
    border:"1px solid #ccc",
    fontSize:14
  }}
/>

<input
  placeholder="Telefone"
  value={telefone}
  onChange={(e) => setTelefone(e.target.value)}
  style={{
    padding:8,
    marginBottom:6,
    borderRadius:6,
    border:"1px solid #ccc",
    fontSize:14
  }}
/>

<input
  placeholder="Endereço"
  value={endereco}
  onChange={(e) => setEndereco(e.target.value)}
  style={{
    padding:8,
    marginBottom:6,
    borderRadius:6,
    border:"1px solid #ccc",
    fontSize:14
  }}
/>

<select
  value={formaPagamento}
  onChange={(e) => setFormaPagamento(e.target.value)}
   style={{
    padding:8,
    marginBottom:8,
    borderRadius:6,
    border:"1px solid #ccc"
  }}
>
    <option value="">Forma de pagamento</option>
    <option value="Dinheiro">Dinheiro</option>
    <option value="Pix">Pix</option>
    <option value="Cartão">Cartão</option>
  </select>

  {/* ITENS */}
  <div style={{
  flex:1,
  overflowY:"auto",
  marginBottom:10
}}>
    {carrinho.length === 0 && <p>Carrinho vazio</p>}

    {carrinho.map((item,index)=>(
  <div key={index} style={{
    borderBottom:"1px solid #eee",
    padding:"8px 0"
  }}>

    <b>{item.nome}</b>

    {/* CONTROLE DE QUANTIDADE */}
    <div style={{
  display:"flex",
  alignItems:"center",
  gap:8,
  marginTop:8
}}>

  {/* BOTÃO - */}
  <button
    onClick={()=>diminuirQuantidade(item.id)}
    style={{
      width:20,
      height:20,
      borderRadius:"50%",
      border:"none",
      background:"#232323",
      color:"#fff",
      fontWeight:"bold",
      cursor:"pointer",
      fontSize:16,
      transition:"0.2s",
      
      
    }}
  >
    -
  </button>

  {/* QUANTIDADE */}
  <span style={{
    minWidth:20,
    textAlign:"center",
    fontWeight:"bold"
  }}>
    {item.quantidade}
  </span>

  {/* BOTÃO + */}
  <button
    onClick={()=>aumentarQuantidade(item.id)}
    style={{
      width:20,
      height:20,
      borderRadius:"50%",
      border:"none",
      background:"#d62828",
      color:"#fff",
      fontWeight:"bold",
      cursor:"pointer",
      fontSize:16,
      transition:"0.2s",
    }}
  >
    +
  </button>

  {/* REMOVER */}
  <button 
  onClick={()=>removerItem(item.id)}
  style={{
    marginLeft:"auto",
    width:16,
    height:16,
    borderRadius:"50%",
    /*border:"1px solid #ff4d4f",*/
    boxShadow:"0 15px 40px rgba(0,0,0,0.5)",
    background:"#232323",
    color:"#ffffff",
    cursor:"pointer",
    fontSize:10,
    display:"flex",
    alignItems:"center",
    justifyContent:"center"
  }}
>
  ✕
</button>
</div>

    {/* INGREDIENTES */}
    {Array.isArray(item.ingredientesSelecionados) && (
      <div style={{marginTop:5}}>

        <div style={{fontSize:12, marginBottom:3}}>
          Ingredientes:
        </div>

        <div style={{
          display:"flex",
          flexWrap:"wrap",
          gap:"5px"
        }}>
          
          {item.ingredientesSelecionados.map((ing,index)=>(
            <span key={index} style={{
              background:"#ffd6d6",
              padding:"2px 6px",
              borderRadius:6,
              fontSize:11
            }}>
              {ing}
            </span>
          ))}

        </div>

      </div>
    )}

    {/* ESCOLHER INGREDIENTES */}
    {Array.isArray(item.ingredientes) && (
      <div style={{marginTop:6}}>

        {item.ingredientes.map((ing:string, i:number)=>(
          <label key={i} style={{fontSize:12, display:"block"}}>

            <input
              type="checkbox"
              checked={item.ingredientesSelecionados?.includes(ing)}
              onChange={()=>toggleIngrediente(item.id, ing)}
            />

            {ing}

          </label>
        ))}

      </div>
    )}

  </div>
))}
  </div>

  {/* TOTAL */}
  <strong>Total: R$ {total.toFixed(2)}</strong>

 

  <button
  onClick={finalizarPedido}
  style={{
    background:"#25D366",
    color:"#fff",
    padding:"10px",
    borderRadius:8,
    border:"none",
    marginTop:10,
    fontWeight:"bold"
  }}
>
  WhatsApp 📱
</button>

<button
  onClick={pagarOnline}
  style={{
    background:"#d62828",
    color:"#fff",
    padding:"10px",
    borderRadius:8,
    border:"none",
    marginTop:10,
    fontWeight:"bold"
  }}
>
  Pagar Online 💳
</button>

</div>

 </div> 
 
</div> 

</div> 
);
}

function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>

      {/*ROUTES*/}

      <Routes>
        <Route path="/" element={<Loja />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="/admin/produtos" element={<PrivateRoute><ProdutosAdmin /></PrivateRoute>} />
        <Route path="/visitas" element={<PrivateRoute><Visitas /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        {/*<Route path="/admin/visitas" element={<Visitas />} /> */}
        {/*<Route path="/dashboard" element={<Dashboard />} /> */}


        <Route path="/precificacao" element={<Precificacao />} />
        

      </Routes>
    </div>
  );
}

export default App;
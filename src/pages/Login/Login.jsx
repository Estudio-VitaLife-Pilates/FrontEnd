import { useState } from "react";
import './Login.css';
 export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [exibirSenha,setExibirSenha]=useState(false)

  function setValorEmail(e){
    setEmail(e.target.value)
  }
  function setValorSenha(e){
    setSenha(e.target.value)
  }
  function setValorExibirSenha(){
    setExibirSenha(!exibirSenha)
  }

  return (
  <div className="tela-login">
      <div className="corpo-login">
        <div className="app-login">
          
         
          <div className="lado-formulario">
            <div className="conteudo-formulario">
              
         
              <div className="cabecalho-marca">
                <div className="fundo-icone-marca">
                  <img className="icone-marca" src="src/assets/iconeSimples.png" alt="Ícone Logo" />
                </div>
                <div className="texto-marca">
                  <span className="etiqueta-studio">Studio</span>
                  <span className="nome-marca">Thais Almeida</span>
                </div>
              </div>
              
              {/* Títulos da Tela */}
              <div className="cabecalho-login">
                <span className="etiqueta-restrita">Área restrita</span>
                <h1 className="titulo-login">Entrar no sistema</h1>
              </div>
              
              {/* Formulário de Acesso */}
              <form className="formulario-login" >
                
                {/* Campo de E-mail */}
                <div className="grupo-campo">
                  <label className="rotulo-campo" htmlFor="email">E-mail</label>
                  <div className="container-input">
                    <input 
                      type="email" 
                      id="email" 
                      className="input-formulario" 
                      placeholder="nome@email.com" 
                     
                      value={email}
                     onChange={setValorEmail}
                      required 
                    />
                    <img className="icone-input-esquerdo" src="src/assets/email.svg" alt="E-mail" />
                  </div>
                </div>
                
                {/* Campo de Senha */}
                <div className="grupo-campo">
                  <label className="rotulo-campo" htmlFor="senha">Senha</label>
                  <div className="container-input">
                    <input 
                    type={exibirSenha? "text":"password"}
                      id="senha" 
                      className="input-formulario input-senha" 
                      placeholder="••••••••" 
                      value={senha}
                      onChange={setValorSenha}
                     
                      required 
                    />
                    <img className="icone-input-esquerdo" src="src/assets/cadeado.svg" alt="Cadeado" />
                    <button 
                      type="button" 
                      className="botao-alternar-senha" 
                      onClick={setValorExibirSenha}
                    >
                      <img className="icone-alternar" src="src/assets/olhosenha.svg" alt="Ver senha" />
                    </button>
                  </div>
                </div>
                
                {/* Link Esqueci Minha Senha */}
                <div className="container-esqueci-senha">
                  <a href="#esqueci" className="link-esqueci-senha">
                    Esqueci minha senha
                  </a>
                </div>

                {/* Botão de Enviar */}
                <button type="submit" className="botao-enviar">
                  <span className="texto-botao-enviar">Entrar</span>
                </button>
              </form>
              
              {/* Chamada para Cadastro */}
              <div className="bloco-cadastro">
                <span className="texto-cadastro">Não tem uma conta?</span>
                <a href="#cadastrar" className="link-cadastro">Cadastrar-se</a>
              </div>
              
            </div>
          </div>
          
          {/* LADO DIREITO: BANNER VISUAL */}
          <div className="lado-banner">
            <img className="padrao-banner" src="src/assets/flow-pattern0.svg" alt="Pattern Background" />
            <div className="circulo-decorativo-baixo"></div>
            <div className="circulo-decorativo-cima"></div>
            <img className="logo-banner" src="src/assets/logo.svg" alt="Logo Fluire" />
          </div>
          
        </div>
      </div>
    </div>
  );
}


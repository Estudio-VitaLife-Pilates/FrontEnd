import { useState } from "react";
import './Login.css';
import { Banner } from "../../components/LoginCadastro/Banner";
import { LogoTitulo } from "../../components/LoginCadastro/LogoTitulo";
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
    const executarLogin = (event) => {
    event.preventDefault();
    
    
    
    
    console.log('Login solicitado:', { email, senha });
  };

  return (
  <div className="tela-login">
      <div className="corpo-login">
        <div className="app-login">
          
         
          <div className="lado-formulario">
            <div className="conteudo-formulario">
              
         
            <LogoTitulo></LogoTitulo>
              
        
              <div className="cabecalho-login">
                <span className="etiqueta-restrita">Área restrita</span>
                <h1 className="titulo-login">Entrar no sistema</h1>
              </div>
              
              <form className="formulario-login" onSubmit={executarLogin}>
                
           
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
            
                <div className="container-esqueci-senha">
                  <a href="#esqueci" className="link-esqueci-senha">
                    Esqueci minha senha
                  </a>
                </div>

                <button type="submit" className="botao-enviar" >
                  <span className="texto-botao-enviar">Entrar</span>

                </button>
              </form>
              
             
              <div className="bloco-cadastro">
                <span className="texto-cadastro">Não tem uma conta?</span>
                <a href="/cadastro" className="link-cadastro">Cadastrar-se</a>
              </div>
              
            </div>
          </div>
          
         
   <Banner/>
          
        </div>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import './Cadastro.css';
import { Banner } from '../../components/LoginCadastro/Banner';
import { LogoTitulo } from '../../components/LoginCadastro/LogoTitulo';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [exibirSenha, setExibirSenha] = useState(false);
  const [exibirConfirmarSenha, setExibirConfirmarSenha] = useState(false);

    function setValorEmail(e){
    setEmail(e.target.value)
  }
  function setValorNome(e){
    setNome(e.target.value)
  }
  function setValorSenha(e){
    setSenha(e.target.value)
  }
  function setValorExibirSenha(){
    setExibirSenha(!exibirSenha)
  }
  function setValorConfirmarSenha(e){
    setConfirmarSenha(e.target.value)
  }
  function setValorExibirConfirmarSenha(){
    setExibirConfirmarSenha(!exibirConfirmarSenha)
  }


  const executarCadastro = (event) => {
    event.preventDefault();
    
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }
    
    console.log('Cadastro solicitado:', { nome, email, senha });
  };

  return (
    <div className="tela-cadastro">
      <div className="corpo-cadastro">
        <div className="app-cadastro">
          <Banner></Banner>
        


          <div className="lado-formulario"> 
            <div className="conteudo-formulario">
              <LogoTitulo></LogoTitulo>
            
          
              <div className="cabecalho-cadastro">
                <span className="etiqueta-acesso">Primeiro acesso</span>
                <h1 className="titulo-cadastro">Criar conta</h1>
                <p className="subtitulo-cadastro">Preencha os dados abaixo para começar.</p>
              </div>
              
       
              <form className="formulario-cadastro" onSubmit={executarCadastro}>
                
                <div className="grupo-campo">
                  <label className="rotulo-campo" htmlFor="nome">Nome completo</label>
                  <div className="container-input">
                    <input 
                      type="text" 
                      id="nome" 
                      className="input-formulario" 
                      placeholder="Seu nome e sobrenome" 
                      value={nome}
                      onChange={setValorNome}
                      required 
                    />
                    <img className="icone-input-esquerdo" src="src/assets/iconeperfil.svg" alt="Ícone usuário" />
                  </div>
                </div>

                
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
                      type={exibirSenha ? "text" : "password"} 
                      id="senha" 
                      className="input-formulario input-senha" 
                      placeholder="Mínimo 6 caracteres" 
                      value={senha}
                      onChange={setValorSenha}
                      minLength={6}
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

                <div className="grupo-campo">
                  <label className="rotulo-campo" htmlFor="confirmarSenha">Confirmar senha</label>
                  <div className="container-input">
                    <input 
                      type={exibirConfirmarSenha ? "text" : "password"} 
                      id="confirmarSenha" 
                      className="input-formulario input-senha" 
                      placeholder="Repita a senha" 
                      value={confirmarSenha}
                      onChange={setValorConfirmarSenha}
                      required 
                    />
                    <img className="icone-input-esquerdo" src="src/assets/cadeado.svg" alt="Confirmar Cadeado" />
                    <button 
                      type="button" 
                      className="botao-alternar-senha" 
                      onClick={setValorExibirConfirmarSenha}
                    >
                      <img className="icone-alternar" src="src/assets/olhosenha.svg" alt="Ver confirmação" />
                    </button>
                  </div>
                </div>

               
                <button type="submit" className="botao-enviar">
                  <span className="texto-botao-enviar">Criar conta</span>
                </button>
              </form>
              
              
              <div className="bloco-login">
                <span className="texto-login">Já tem uma conta?</span>
                <a href="/" className="link-login">Entrar</a>
              </div>

              
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
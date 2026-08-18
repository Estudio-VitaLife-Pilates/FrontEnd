import React, { useState } from 'react';
import styles from './Cadastro.module.css';
import { Banner } from '../../components/LoginCadastro/Banner';
import { LogoTitulo } from '../../components/LoginCadastro/LogoTitulo';
import iconePerfil from '../../assets/iconeperfil.svg';
import iconeEmail from '../../assets/email.svg';
import iconeCadeado from '../../assets/cadeado.svg';
import iconeOlhoSenha from '../../assets/olhosenha.svg';

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
    <div className={styles["tela-cadastro"]}>
      <div className={styles["corpo-cadastro"]}>
        <div className={styles["app-cadastro"]}>
          <Banner></Banner>


          <div className={styles["lado-formulario"]}>
            <div className={styles["conteudo-formulario"]}>
              <LogoTitulo></LogoTitulo>


              <div className={styles["cabecalho-cadastro"]}>
                <span className={styles["etiqueta-acesso"]}>Primeiro acesso</span>
                <h1 className={styles["titulo-cadastro"]}>Criar conta</h1>
                <p className={styles["subtitulo-cadastro"]}>Preencha os dados abaixo para começar.</p>
              </div>


              <form className={styles["formulario-cadastro"]} onSubmit={executarCadastro}>

                <div className={styles["grupo-campo"]}>
                  <label className={styles["rotulo-campo"]} htmlFor="nome">Nome completo</label>
                  <div className={styles["container-input"]}>
                    <input
                      type="text"
                      id="nome"
                      className={styles["input-formulario"]}
                      placeholder="Seu nome e sobrenome"
                      value={nome}
                      onChange={setValorNome}
                      required
                    />
                    <img className={styles["icone-input-esquerdo"]} src={iconePerfil} alt="Ícone usuário" />
                  </div>
                </div>


                <div className={styles["grupo-campo"]}>
                  <label className={styles["rotulo-campo"]} htmlFor="email">E-mail</label>
                  <div className={styles["container-input"]}>
                    <input
                      type="email"
                      id="email"
                      className={styles["input-formulario"]}
                      placeholder="nome@email.com"
                      value={email}
                      onChange={setValorEmail}
                      required
                    />
                    <img className={styles["icone-input-esquerdo"]} src={iconeEmail} alt="E-mail" />
                  </div>
                </div>


                <div className={styles["grupo-campo"]}>
                  <label className={styles["rotulo-campo"]} htmlFor="senha">Senha</label>
                  <div className={styles["container-input"]}>
                    <input
                      type={exibirSenha ? "text" : "password"}
                      id="senha"
                      className={`${styles["input-formulario"]} ${styles["input-senha"]}`}
                      placeholder="Mínimo 6 caracteres"
                      value={senha}
                      onChange={setValorSenha}
                      minLength={6}
                      required
                    />
                    <img className={styles["icone-input-esquerdo"]} src={iconeCadeado} alt="Cadeado" />
                    <button
                      type="button"
                      className={styles["botao-alternar-senha"]}
                      onClick={setValorExibirSenha}
                    >
                      <img className={styles["icone-alternar"]} src={iconeOlhoSenha} alt="Ver senha" />
                    </button>
                  </div>
                </div>

                <div className={styles["grupo-campo"]}>
                  <label className={styles["rotulo-campo"]} htmlFor="confirmarSenha">Confirmar senha</label>
                  <div className={styles["container-input"]}>
                    <input
                      type={exibirConfirmarSenha ? "text" : "password"}
                      id="confirmarSenha"
                      className={`${styles["input-formulario"]} ${styles["input-senha"]}`}
                      placeholder="Repita a senha"
                      value={confirmarSenha}
                      onChange={setValorConfirmarSenha}
                      required
                    />
                    <img className={styles["icone-input-esquerdo"]} src={iconeCadeado} alt="Confirmar Cadeado" />
                    <button
                      type="button"
                      className={styles["botao-alternar-senha"]}
                      onClick={setValorExibirConfirmarSenha}
                    >
                      <img className={styles["icone-alternar"]} src={iconeOlhoSenha} alt="Ver confirmação" />
                    </button>
                  </div>
                </div>


                <button type="submit" className={styles["botao-enviar"]}>
                  <span className={styles["texto-botao-enviar"]}>Criar conta</span>
                </button>
              </form>


              <div className={styles["bloco-login"]}>
                <span className={styles["texto-login"]}>Já tem uma conta?</span>
                <a href="/" className={styles["link-login"]}>Entrar</a>
              </div>


            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

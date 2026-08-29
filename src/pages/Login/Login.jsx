import { useState } from "react";
import styles from './Login.module.css';
import { Banner } from "../../components/LoginCadastro/Banner";
import { LogoTitulo } from "../../components/LoginCadastro/LogoTitulo";
import iconeEmail from "../../assets/email.svg";
import iconeCadeado from "../../assets/cadeado.svg";
import iconeOlhoSenha from "../../assets/olhosenha.svg";

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
  <div className={styles["tela-login"]}>
      <div className={styles["corpo-login"]}>
        <div className={styles["app-login"]}>


          <div className={styles["lado-formulario"]}>
            <div className={styles["conteudo-formulario"]}>


            <LogoTitulo></LogoTitulo>


              <div className={styles["cabecalho-login"]}>
                <span className={styles["etiqueta-restrita"]}>Área restrita</span>
                <h1 className={styles["titulo-login"]}>Entrar no sistema</h1>
              </div>

              <form className={styles["formulario-login"]} onSubmit={executarLogin}>


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
                    type={exibirSenha? "text":"password"}
                      id="senha"
                      className={`${styles["input-formulario"]} ${styles["input-senha"]}`}
                      placeholder="••••••••"
                      value={senha}
                      onChange={setValorSenha}

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

                <div className={styles["container-esqueci-senha"]}>
                  <a href="#esqueci" className={styles["link-esqueci-senha"]}>
                    Esqueci minha senha
                  </a>
                </div>

                <button type="submit" className={styles["botao-enviar"]} >
                  <span className={styles["texto-botao-enviar"]}>Entrar</span>

                </button>
              </form>


              <div className={styles["bloco-cadastro"]}>
                <span className={styles["texto-cadastro"]}>Não tem uma conta?</span>
                <a href="/cadastro" className={styles["link-cadastro"]}>Cadastrar-se</a>
              </div>

            </div>
          </div>


   <Banner/>

        </div>
      </div>
    </div>
  );
}

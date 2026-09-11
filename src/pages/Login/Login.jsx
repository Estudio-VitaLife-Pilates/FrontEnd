
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

import { Banner } from "../../components/LoginCadastro/Banner";
import { LogoTitulo } from "../../components/LoginCadastro/LogoTitulo";

import iconeEmail from "../../assets/email.svg";
import iconeCadeado from "../../assets/cadeado.svg";
import iconeOlhoSenha from "../../assets/olhosenha.svg";

import { login } from "../../api/usuarios";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [exibirSenha, setExibirSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erroLogin, setErroLogin] = useState(null);

  function setValorEmail(e) {
    setEmail(e.target.value);
  }

  function setValorSenha(e) {
    setSenha(e.target.value);
  }

  function setValorExibirSenha() {
    setExibirSenha((valorAtual) => !valorAtual);
  }

  async function executarLogin(event) {
    event.preventDefault();
    setErroLogin(null);

    try {
      setCarregando(true);

      await login({
        email,
        senha,
      });

      navigate("/inicio");
    } catch (erro) {
      // A API responde 401 sem corpo legível tanto para e-mail inexistente quanto
      // para senha errada, então nunca mostramos o texto cru do erro aqui.
      setErroLogin(
        erro.status === null
          ? "Não foi possível conectar ao servidor. Tente novamente."
          : "E-mail ou senha inválidos. Verifique os dados e tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className={styles["tela-login"]}>
      <div className={styles["corpo-login"]}>
        <div className={styles["app-login"]}>

          <div className={styles["lado-formulario"]}>
            <div className={styles["conteudo-formulario"]}>

              <LogoTitulo />

              <div className={styles["cabecalho-login"]}>
                <span className={styles["etiqueta-restrita"]}>
                  Área restrita
                </span>

                <h1 className={styles["titulo-login"]}>
                  Entrar no sistema
                </h1>
              </div>

              {erroLogin && (
                <p className={styles["mensagem-erro"]}>{erroLogin}</p>
              )}

              <form
                className={styles["formulario-login"]}
                onSubmit={executarLogin}
              >

                <div className={styles["grupo-campo"]}>
                  <label
                    className={styles["rotulo-campo"]}
                    htmlFor="email"
                  >
                    E-mail
                  </label>

                  <div className={styles["container-input"]}>
                    <input
                      type="email"
                      id="email"
                      className={styles["input-formulario"]}
                      placeholder="nome@email.com"
                      value={email}
                      onChange={setValorEmail}
                      required
                      autoComplete="email"
                    />

                    <img
                      className={styles["icone-input-esquerdo"]}
                      src={iconeEmail}
                      alt=""
                    />
                  </div>
                </div>

                <div className={styles["grupo-campo"]}>
                  <label
                    className={styles["rotulo-campo"]}
                    htmlFor="senha"
                  >
                    Senha
                  </label>

                  <div className={styles["container-input"]}>
                    <input
                      type={exibirSenha ? "text" : "password"}
                      id="senha"
                      className={`${styles["input-formulario"]} ${styles["input-senha"]}`}
                      placeholder="••••••••"
                      value={senha}
                      onChange={setValorSenha}
                      required
                      autoComplete="current-password"
                    />

                    <img
                      className={styles["icone-input-esquerdo"]}
                      src={iconeCadeado}
                      alt=""
                    />

                    <button
                      type="button"
                      className={styles["botao-alternar-senha"]}
                      onClick={setValorExibirSenha}
                      aria-label={
                        exibirSenha
                          ? "Ocultar senha"
                          : "Mostrar senha"
                      }
                    >
                      <img
                        className={styles["icone-alternar"]}
                        src={iconeOlhoSenha}
                        alt=""
                      />
                    </button>
                  </div>
                </div>

                <div className={styles["container-esqueci-senha"]}>
                  <a
                    href="#esqueci"
                    className={styles["link-esqueci-senha"]}
                  >
                    Esqueci minha senha
                  </a>
                </div>

                <button
                  type="submit"
                  className={styles["botao-enviar"]}
                  disabled={carregando}
                >
                  <span className={styles["texto-botao-enviar"]}>
                    {carregando ? "Entrando..." : "Entrar"}
                  </span>
                </button>

              </form>

              <div className={styles["bloco-cadastro"]}>
                <span className={styles["texto-cadastro"]}>
                  Não tem uma conta?
                </span>

                <a
                  href="/cadastro"
                  className={styles["link-cadastro"]}
                >
                  Cadastrar-se
                </a>
              </div>

            </div>
          </div>

          <Banner />

        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Perfil.module.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { buscarMeuPerfil, logout } from "../../api/usuarios";
import { FiMail, FiLogOut } from "react-icons/fi";

export default function Perfil() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    buscarMeuPerfil()
      .then(setUsuario)
      .catch(() => setErro("Não foi possível carregar os dados do perfil."))
      .finally(() => setCarregando(false));
  }, []);

  function executarSair() {
    logout()
      .catch(() => {})
      .finally(() => navigate("/"));
  }

  return (
    <div className={styles["pagina-perfil"]}>
      <Navbar />

      <div className={styles.conteudo}>
        <span className={styles["etiqueta-perfil"]}>Perfil</span>
        <h1 className={styles["titulo-pagina"]}>Meu perfil</h1>

        {erro && <p className={styles["mensagem-erro"]}>{erro}</p>}

        {carregando ? (
          <p className={styles["mensagem-info"]}>Carregando…</p>
        ) : usuario ? (
          <div className={styles["cartao-perfil"]}>
            <div className={styles["avatar-perfil"]}>
              {usuario.nome.charAt(0).toUpperCase()}
            </div>

            <div className={styles["info-perfil"]}>
              <h2 className={styles["nome-perfil"]}>{usuario.nome}</h2>

              <div className={styles["campo-perfil"]}>
                <FiMail size={16} />
                <span>{usuario.email}</span>
              </div>
            </div>

            <button className={styles["botao-sair"]} onClick={executarSair}>
              <FiLogOut size={16} />
              Sair da conta
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

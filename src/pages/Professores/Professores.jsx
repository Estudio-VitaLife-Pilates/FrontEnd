import { useEffect, useState } from "react";
import styles from "./Professores.module.css";
import { Navbar } from "../../components/Navbar/Navbar";
import {
  cadastrarProfessor,
  listarProfessores,
  removerProfessor,
} from "../../api/professores";
import iconeMais from "../../assets/icone-mais.svg";
import iconeBusca from "../../assets/icone-busca.svg";
import iconeTelefone from "../../assets/icone-telefone.svg";
import iconeLixeira from "../../assets/icone-lixeira.svg";

export default function Professores() {
  const [professores, setProfessores] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarProfessores();
  }, []);

  function carregarProfessores() {
    setCarregando(true);
    setErro(null);
    listarProfessores()
      .then((dados) => setProfessores(dados ?? []))
      .catch(() => setErro("Não foi possível carregar os professores."))
      .finally(() => setCarregando(false));
  }

  function setValorBusca(e) {
    setBusca(e.target.value);
  }

  const professoresFiltrados = professores.filter((professor) =>
    professor.nome.toLowerCase().includes(busca.toLowerCase())
  );

  function abrirModal() {
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setNome("");
    setTelefone("");
    setEmail("");
  }

  function executarCadastro(event) {
    event.preventDefault();
    setEnviando(true);
    cadastrarProfessor({ nome, telefone, email, ativo: true })
      .then(() => {
        fecharModal();
        carregarProfessores();
      })
      .catch(() => setErro("Não foi possível cadastrar o professor."))
      .finally(() => setEnviando(false));
  }

  function executarRemocao(id) {
    if (!window.confirm("Remover este professor?")) return;
    removerProfessor(id)
      .then(carregarProfessores)
      .catch(() => setErro("Não foi possível remover o professor."));
  }

  return (
    <div className={styles["pagina-professores"]}>
      <Navbar />

      <div className={styles.conteudo}>
        <div className={styles["cabecalho-pagina"]}>
          <div>
            <span className={styles["etiqueta-equipe"]}>Equipe</span>
            <h1 className={styles["titulo-pagina"]}>Professores</h1>
          </div>
          <button className={styles["botao-cadastrar"]} onClick={abrirModal}>
            <img src={iconeMais} alt="" className={styles["icone-botao"]} />
            Cadastrar
          </button>
        </div>

        <div className={styles["grupo-busca"]}>
          <label className={styles["rotulo-busca"]} htmlFor="busca">
            Busque por nome
          </label>
          <div className={styles["container-busca"]}>
            <img src={iconeBusca} alt="" className={styles["icone-busca"]} />
            <input
              id="busca"
              className={styles["input-busca"]}
              placeholder="Ex: Thais"
              value={busca}
              onChange={setValorBusca}
            />
          </div>
        </div>

        {erro && <p className={styles["mensagem-erro"]}>{erro}</p>}

        {carregando ? (
          <p className={styles["mensagem-info"]}>Carregando professores…</p>
        ) : professoresFiltrados.length === 0 ? (
          <p className={styles["mensagem-info"]}>
            Nenhum professor encontrado.
          </p>
        ) : (
          <>
            <div className={styles["cabecalho-tabela"]}>
              <span>Nome</span>
              <span>Telefone</span>
              <span>Ações</span>
            </div>

            <ul className={styles["lista-professores"]}>
              {professoresFiltrados.map((professor) => (
                <li className={styles["cartao-professor"]} key={professor.id}>
                  <div className={styles["info-professor"]}>
                    <div className={styles["avatar-professor"]}>
                      {professor.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles["texto-professor"]}>
                      <span className={styles["rotulo-nome"]}>Nome</span>
                      <span className={styles["nome-professor"]}>
                        {professor.nome}
                      </span>
                    </div>
                  </div>

                  <div className={styles["telefone-professor"]}>
                    <img
                      src={iconeTelefone}
                      alt=""
                      className={styles["icone-telefone"]}
                    />
                    <span>{professor.telefone}</span>
                  </div>

                  <div className={styles["acoes-professor"]}>
                    <button
                      className={styles["botao-remover"]}
                      onClick={() => executarRemocao(professor.id)}
                      aria-label={`Remover ${professor.nome}`}
                    >
                      <img src={iconeLixeira} alt="" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {modalAberto && (
        <div className={styles["fundo-modal"]} onClick={fecharModal}>
          <div
            className={styles["caixa-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles["titulo-modal"]}>Cadastrar professor</h2>
            <form onSubmit={executarCadastro}>
              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="nome">
                  Nome completo
                </label>
                <input
                  id="nome"
                  className={styles["input-modal"]}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="telefone">
                  Telefone
                </label>
                <input
                  id="telefone"
                  className={styles["input-modal"]}
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                />
              </div>

              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  className={styles["input-modal"]}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles["acoes-modal"]}>
                <button
                  type="button"
                  className={styles["botao-cancelar"]}
                  onClick={fecharModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles["botao-salvar"]}
                  disabled={enviando}
                >
                  {enviando ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

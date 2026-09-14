import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./DadosProfessor.module.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { buscarProfessorPorId, removerProfessor } from "../../api/professores";
import {
  buscarVagasTurma,
  editarTurma,
  listarTurmas,
  listarTurmasPorProfessor,
} from "../../api/turmas";
import {
  FiArrowLeft,
  FiPhone,
  FiMail,
  FiCalendar,
  FiUsers,
  FiPlus,
  FiUserX,
} from "react-icons/fi";

const NOMES_DIA_SEMANA = {
  SEGUNDA: "Segunda-feira",
  TERCA: "Terça-feira",
  QUARTA: "Quarta-feira",
  QUINTA: "Quinta-feira",
  SEXTA: "Sexta-feira",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
};

function formatarHorario(diaSemana, horaInicio) {
  const dia = NOMES_DIA_SEMANA[diaSemana] ?? diaSemana;
  const [hora, minuto] = (horaInicio ?? "00:00").split(":");
  const sufixo = minuto && minuto !== "00" ? `${hora}h${minuto}` : `${hora}h`;
  return `${dia}, ${sufixo}`;
}

export default function DadosProfessor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [professor, setProfessor] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [associando, setAssociando] = useState(false);

  useEffect(() => {
    carregarTudo();
  }, [id]);

  function carregarTudo() {
    setCarregando(true);
    setErro(null);

    Promise.all([buscarProfessorPorId(id), listarTurmasPorProfessor(id)])
      .then(([dadosProfessor, dadosTurmas]) => {
        setProfessor(dadosProfessor);
        return Promise.all(
          (dadosTurmas ?? []).map((turma) =>
            buscarVagasTurma(turma.id).then((vagas) => ({
              ...turma,
              alunosMatriculados: turma.capacidadeMax - vagas,
            }))
          )
        );
      })
      .then(setTurmas)
      .catch(() => setErro("Não foi possível carregar os dados do professor."))
      .finally(() => setCarregando(false));
  }

  function executarRemocao() {
    if (
      !window.confirm(
        `Remover ${professor.nome} da equipe? Essa ação não pode ser desfeita.`
      )
    )
      return;

    removerProfessor(professor.id)
      .then(() => navigate("/professores"))
      .catch(() => setErro("Não foi possível remover o professor."));
  }

  function abrirModalAssociar() {
    listarTurmas()
      .then((todas) =>
        setTurmasDisponiveis(
          (todas ?? []).filter((t) => String(t.professorId) !== String(id))
        )
      )
      .catch(() => setErro("Não foi possível carregar as turmas disponíveis."));
    setTurmaSelecionada("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  function executarAssociacao(event) {
    event.preventDefault();
    const turma = turmasDisponiveis.find(
      (t) => String(t.id) === String(turmaSelecionada)
    );
    if (!turma) return;

    setAssociando(true);
    editarTurma(turma.id, {
      diaSemana: turma.diaSemana,
      horaInicio: turma.horaInicio,
      duracaoMinutos: turma.duracaoMinutos,
      capacidadeMax: turma.capacidadeMax,
      ativa: turma.ativa,
      professorId: Number(id),
    })
      .then(() => {
        fecharModal();
        carregarTudo();
      })
      .catch(() => setErro("Não foi possível associar a turma."))
      .finally(() => setAssociando(false));
  }

  return (
    <div className={styles["pagina-dados-professor"]}>
      <Navbar />

      <div className={styles.conteudo}>
        <button
          className={styles["link-voltar"]}
          onClick={() => navigate("/professores")}
        >
          <FiArrowLeft size={14} />
          Voltar para professores
        </button>

        {erro && <p className={styles["mensagem-erro"]}>{erro}</p>}

        {carregando ? (
          <p className={styles["mensagem-info"]}>Carregando…</p>
        ) : !professor ? (
          <p className={styles["mensagem-info"]}>Professor não encontrado.</p>
        ) : (
          <>
            <div className={styles["cartao-perfil"]}>
              <div className={styles["avatar-perfil"]}>
                {professor.nome.charAt(0).toUpperCase()}
              </div>

              <div className={styles["info-perfil"]}>
                <div className={styles["linha-nome"]}>
                  <h1 className={styles["nome-perfil"]}>{professor.nome}</h1>
                  <span
                    className={`${styles.badge} ${
                      professor.ativo ? styles.badgeAtivo : styles.badgeInativo
                    }`}
                  >
                    {professor.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>

                <div className={styles["campo-editavel"]}>
                  <FiPhone size={16} />
                  <div>
                    <span className={styles["rotulo-campo-perfil"]}>
                      Telefone
                    </span>
                    <span className={styles["valor-campo-perfil"]}>
                      {professor.telefone}
                    </span>
                  </div>
                </div>

                <div className={styles["campo-editavel"]}>
                  <FiMail size={16} />
                  <div>
                    <span className={styles["rotulo-campo-perfil"]}>
                      E-mail
                    </span>
                    <span className={styles["valor-campo-perfil"]}>
                      {professor.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles["cartao-kpi-turmas"]}>
                <div className={styles["icone-kpi-turmas"]}>
                  <FiCalendar size={16} />
                </div>
                <span className={styles["rotulo-kpi-turmas"]}>Turmas</span>
                <span className={styles["valor-kpi-turmas"]}>
                  {turmas.length}
                </span>
                <span className={styles["legenda-kpi-turmas"]}>
                  atribuídas
                </span>
              </div>
            </div>

            <div className={styles["secao-turmas"]}>
              <div className={styles["cabecalho-secao"]}>
                <div>
                  <span className={styles["etiqueta-agenda"]}>Agenda</span>
                  <h2 className={styles["titulo-secao"]}>Turmas atribuídas</h2>
                </div>
                <button
                  className={styles["botao-associar"]}
                  onClick={abrirModalAssociar}
                >
                  <FiPlus size={16} />
                  Associar a turma
                </button>
              </div>

              {turmas.length === 0 ? (
                <p className={styles["mensagem-info"]}>
                  Nenhuma turma atribuída a este professor ainda.
                </p>
              ) : (
                <div className={styles["tabela-turmas"]}>
                  <div className={styles["linha-cabecalho-turmas"]}>
                    <span>Turma</span>
                    <span>Duração</span>
                    <span className={styles["coluna-alunos"]}>Alunos</span>
                  </div>

                  {turmas.map((turma) => (
                    <div className={styles["linha-turma"]} key={turma.id}>
                      <div className={styles["info-turma"]}>
                        <div className={styles["icone-turma"]}>
                          <FiCalendar size={16} />
                        </div>
                        <span>
                          {formatarHorario(turma.diaSemana, turma.horaInicio)}
                        </span>
                      </div>
                      <span className={styles["duracao-turma"]}>
                        {turma.duracaoMinutos} min de duração
                      </span>
                      <span className={styles["alunos-turma"]}>
                        <FiUsers size={14} />
                        {turma.alunosMatriculados}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles["cartao-perigo"]}>
              <div>
                <p className={styles["titulo-perigo"]}>Remover professor</p>
                <p className={styles["texto-perigo"]}>
                  Esta ação remove o professor da equipe e não pode ser
                  desfeita.
                </p>
              </div>
              <button
                className={styles["botao-remover-professor"]}
                onClick={executarRemocao}
              >
                <FiUserX size={16} />
                Remover
              </button>
            </div>
          </>
        )}
      </div>

      {modalAberto && (
        <div className={styles["fundo-modal"]} onClick={fecharModal}>
          <div
            className={styles["caixa-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles["titulo-modal"]}>Associar a turma</h2>

            <form onSubmit={executarAssociacao}>
              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="turma">
                  Turma
                </label>
                <select
                  id="turma"
                  className={styles["input-modal"]}
                  value={turmaSelecionada}
                  onChange={(e) => setTurmaSelecionada(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecione uma turma
                  </option>
                  {turmasDisponiveis.map((turma) => (
                    <option value={turma.id} key={turma.id}>
                      {formatarHorario(turma.diaSemana, turma.horaInicio)}
                      {turma.professorNome
                        ? ` (atualmente com ${turma.professorNome})`
                        : ""}
                    </option>
                  ))}
                </select>
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
                  disabled={associando || !turmaSelecionada}
                >
                  {associando ? "Associando…" : "Associar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "./DadosAluno.module.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { CalendarioMensal } from "../../components/CalendarioMensal/CalendarioMensal";
import { useConfirmacao } from "../../hooks/useConfirmacao";
import {
  associarPlano,
  buscarAlunoDetalhadoPorId,
  editarAluno,
  inativarAluno,
  reativarAluno,
} from "../../api/alunos";
import {
  adicionarAlunoNaTurma,
  listarAlunosDaTurma,
  listarTurmas,
  removerAlunoDaTurma,
} from "../../api/turmas";
import { listarPlanos } from "../../api/planos";
import {
  cancelarAulaDoAluno,
  listarAulasDoAlunoPaginadas,
  registrarReposicao,
  buscarProximasAulasDaTurma,
} from "../../api/aulas";
import {
  FiArrowLeft,
  FiPhone,
  FiMail,
  FiCreditCard,
  FiUserX,
  FiUserCheck,
  FiUsers,
  FiEdit2,
  FiX,
  FiRepeat,
  FiPlus,
  FiXCircle,
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

const NOMES_DIA_CURTO = {
  SEGUNDA: "Seg",
  TERCA: "Ter",
  QUARTA: "Qua",
  QUINTA: "Qui",
  SEXTA: "Sex",
  SABADO: "Sáb",
  DOMINGO: "Dom",
};

const ROTULOS_STATUS = {
  AGENDADO: "Agendada",
  REPOSICAO: "Reposição",
  CANCELADA: "Cancelada",
  AUSENTE: "Ausente",
  REALIZADA: "Presença confirmada",
};

const ESTILO_STATUS = {
  AGENDADO: "badgeAgendada",
  REPOSICAO: "badgeReposicao",
  CANCELADA: "badgeCancelada",
  AUSENTE: "badgeAusente",
  REALIZADA: "badgeRealizada",
};

function statusDaAula(item) {
  const status = item.status;

  return {
    rotulo: ROTULOS_STATUS[status] ?? status,
    estilo: ESTILO_STATUS[status] ?? "badgeAgendada",
  };
}

function formatarHorario(diaSemana, horaInicio) {
  const dia = NOMES_DIA_SEMANA[diaSemana] ?? diaSemana ?? "—";
  const [hora, minuto] = (horaInicio ?? "00:00").split(":");
  const sufixo =
    minuto && minuto !== "00" ? `${hora}h${minuto}` : `${hora}h`;

  return `${dia}, ${sufixo}`;
}

function formatarHorarioCurto(diaSemana, horaInicio) {
  const dia = NOMES_DIA_CURTO[diaSemana] ?? diaSemana ?? "—";
  const [hora] = (horaInicio ?? "00:00").split(":");

  return `${dia}, ${hora}h`;
}

function formatarData(data) {
  if (!data) return "—";

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
}

export default function DadosAluno() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [aluno, setAluno] = useState(null);
  const [turmasDoAluno, setTurmasDoAluno] = useState([]);

  // Paginação das aulas
  const [aulas, setAulas] = useState([]);
  const [paginaAulas, setPaginaAulas] = useState(0);
  const [totalPaginasAulas, setTotalPaginasAulas] = useState(0);
  const [totalAulas, setTotalAulas] = useState(0);
  const tamanhoPaginaAulas = 10;

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [acaoErro, setAcaoErro] = useState(null);
  const [cancelandoTurmaId, setCancelandoTurmaId] = useState(null);

  const [modalFichaAberto, setModalFichaAberto] = useState(false);
  const [ficha, setFicha] = useState("");

  const [modalDadosAberto, setModalDadosAberto] = useState(false);
  const [formDados, setFormDados] = useState({
    nome: "",
    telefone: "",
    email: "",
    cpf: "",
    dataNascimento: "",
  });
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [erroDados, setErroDados] = useState(null);
  const [salvandoFicha, setSalvandoFicha] = useState(false);
  const [erroFicha, setErroFicha] = useState(null);
  const [confirmar, dialogoConfirmacao] = useConfirmacao();

  const [modalRemarcarAberto, setModalRemarcarAberto] = useState(false);
  const [aulaParaRemarcar, setAulaParaRemarcar] = useState(null);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState([]);
  const [turmaDestinoSelecionada, setTurmaDestinoSelecionada] = useState("");
  const [aulasDaTurmaDestino, setAulasDaTurmaDestino] = useState([]);
  const [carregandoAulasDestino, setCarregandoAulasDestino] = useState(false);
  const [aulaDestinoSelecionada, setAulaDestinoSelecionada] = useState(null);
  const [remarcando, setRemarcando] = useState(false);
  const [erroRemarcar, setErroRemarcar] = useState(null);

  const [modalPlanoAberto, setModalPlanoAberto] = useState(false);
  const [planosDisponiveis, setPlanosDisponiveis] = useState([]);
  const [planoSelecionado, setPlanoSelecionado] = useState("");
  const [vinculandoPlano, setVinculandoPlano] = useState(false);
  const [erroPlano, setErroPlano] = useState(null);

  const [modalTurmaAberto, setModalTurmaAberto] = useState(false);
  const [turmasParaVincular, setTurmasParaVincular] = useState([]);
  const [
    turmaParaVincularSelecionada,
    setTurmaParaVincularSelecionada,
  ] = useState("");
  const [vinculandoTurma, setVinculandoTurma] = useState(false);
  const [erroVincularTurma, setErroVincularTurma] = useState(null);

  useEffect(() => {
    carregarTudo();
  }, [id, paginaAulas]);

  function carregarTudo() {
    setCarregando(true);
    setErro(null);

    Promise.all([
      buscarAlunoDetalhadoPorId(id),
      listarAulasDoAlunoPaginadas(id, paginaAulas, tamanhoPaginaAulas),
      listarTurmas(),
    ])
      .then(([dadosAluno, respostaPaginada, dadosTurmas]) => {
        setAluno(dadosAluno);
        setFicha(dadosAluno.fichaAnamnese ?? "");

        // Compatível com a resposta paginada do Spring
        // e também com uma eventual resposta em formato de lista.
        const conteudo = Array.isArray(respostaPaginada)
          ? respostaPaginada
          : respostaPaginada?.content ?? [];

        const paginas = Array.isArray(respostaPaginada)
          ? 1
          : respostaPaginada?.totalPages ?? 0;

        const total = Array.isArray(respostaPaginada)
          ? respostaPaginada.length
          : respostaPaginada?.totalElements ?? 0;

        setAulas(conteudo);
        setTotalPaginasAulas(paginas);
        setTotalAulas(total);

        // Caso o total de páginas diminua após uma alteração,
        // evita manter a interface em uma página que não existe.
        if (paginas > 0 && paginaAulas >= paginas) {
          setPaginaAulas(paginas - 1);
          return;
        }

        return Promise.all(
          (dadosTurmas ?? []).map((turma) =>
            listarAlunosDaTurma(turma.id).then((detalhe) => ({
              turma,
              temAluno: (detalhe.alunos ?? []).some(
                (a) => String(a.id) === String(id) && a.alunoTurmaAtivo
              ),
            }))
          )
        ).then((porTurma) => {
          const turmasVinculadas = porTurma
            .filter((p) => p.temAluno)
            .map((p) => p.turma);

          setTurmasDoAluno(turmasVinculadas);
        });
      })
      .catch(() => {
        setErro("Não foi possível carregar os dados do aluno.");
      })
      .finally(() => {
        setCarregando(false);
      });
  }

  function irParaPaginaAulas(novaPagina) {
    if (novaPagina < 0 || novaPagina >= totalPaginasAulas) {
      return;
    }

    setPaginaAulas(novaPagina);
  }

  async function executarInativar() {
    const confirmado = await confirmar({
      titulo: "Inativar aluno",
      mensagem: `Inativar ${aluno.nome}? O aluno deixará de aparecer como ativo no sistema.`,
      textoConfirmar: "Inativar",
      perigo: true,
    });
    if (!confirmado) return;

    inativarAluno(aluno.id)
      .then(() => navigate("/alunos"))
      .catch(() => setAcaoErro("Não foi possível inativar o aluno."));
  }

  function executarReativar() {
    setAcaoErro(null);
    reativarAluno(aluno.id)
      .then(carregarTudo)
      .catch(() => setAcaoErro("Não foi possível reativar o aluno."));
  }

  function abrirModalFicha() {
    setErroFicha(null);
    setFicha(aluno.fichaAnamnese ?? "");
    setModalFichaAberto(true);
  }

  function fecharModalFicha() {
    setModalFichaAberto(false);
    setErroFicha(null);
  }

  function executarSalvarFicha(event) {
    event.preventDefault();
    setErroFicha(null);
    setSalvandoFicha(true);

    editarAluno(aluno.id, {
      nome: aluno.nome,
      telefone: aluno.telefone,
      cpf: aluno.cpf,
      email: aluno.email,
      dataNascimento: aluno.dataNascimento,
      fichaAnamnese: ficha,
    })
      .then(() => {
        setModalFichaAberto(false);
        carregarTudo();
      })
      .catch(() => {
        setErroFicha("Não foi possível salvar a ficha de anamnese.");
      })
      .finally(() => setSalvandoFicha(false));
  }

  function abrirModalDados() {
    setFormDados({
      nome: aluno.nome ?? "",
      telefone: aluno.telefone ?? "",
      email: aluno.email ?? "",
      cpf: aluno.cpf ?? "",
      dataNascimento: aluno.dataNascimento ?? "",
    });

    setErroDados(null);
    setModalDadosAberto(true);
  }

  function fecharModalDados() {
    setModalDadosAberto(false);
    setErroDados(null);
  }

  function setValorFormDados(campo) {
    return (event) =>
      setFormDados((atual) => ({
        ...atual,
        [campo]: event.target.value,
      }));
  }

  function executarSalvarDados(event) {
    event.preventDefault();
    setErroDados(null);
    setSalvandoDados(true);

    editarAluno(aluno.id, {
      ...formDados,
      fichaAnamnese: aluno.fichaAnamnese,
    })
      .then(() => {
        setModalDadosAberto(false);
        carregarTudo();
      })
      .catch(() => {
        setErroDados("Não foi possível salvar os dados do aluno.");
      })
      .finally(() => setSalvandoDados(false));
  }

  async function executarCancelar(aula) {
    const confirmado = await confirmar({
      titulo: "Cancelar aula",
      mensagem: "Cancelar esta aula do aluno?",
      textoConfirmar: "Cancelar aula",
      perigo: true,
    });
    if (!confirmado) return;

    setAcaoErro(null);

    cancelarAulaDoAluno(aula.id)
      .then(carregarTudo)
      .catch(() => setAcaoErro("Não foi possível cancelar a aula."));
  }

  async function executarCancelarTurma(turma) {
    const rotulo = formatarHorarioCurto(turma.diaSemana, turma.horaInicio);
    const confirmado = await confirmar({
      titulo: "Cancelar matrícula",
      mensagem: `Cancelar a matrícula do aluno na turma de ${rotulo}? As aulas futuras dessa turma serão canceladas.`,
      textoConfirmar: "Cancelar matrícula",
      perigo: true,
    });
    if (!confirmado) return;

    setAcaoErro(null);
    setCancelandoTurmaId(turma.id);

    removerAlunoDaTurma(turma.id, aluno.id)
      .then(carregarTudo)
      .catch(() => {
        setAcaoErro("Não foi possível cancelar a matrícula na turma.");
      })
      .finally(() => setCancelandoTurmaId(null));
  }

  function abrirModalRemarcar(aula) {
    setErroRemarcar(null);

    listarTurmas()
      .then((turmas) => {
        setTurmasDisponiveis(
          (turmas ?? []).filter((turma) => turma.ativa)
        );
      })
      .catch(() => {
        setErroRemarcar(
          "Não foi possível carregar as turmas disponíveis."
        );
      });

    setAulaParaRemarcar(aula);
    setTurmaDestinoSelecionada("");
    setAulasDaTurmaDestino([]);
    setAulaDestinoSelecionada(null);
    setModalRemarcarAberto(true);
  }

  function selecionarTurmaDestino(turmaId) {
    setTurmaDestinoSelecionada(turmaId);
    setAulaDestinoSelecionada(null);
    setAulasDaTurmaDestino([]);

    if (!turmaId) return;

    setCarregandoAulasDestino(true);
    buscarProximasAulasDaTurma(turmaId)
      .then((dados) => setAulasDaTurmaDestino(dados ?? []))
      .catch(() =>
        setErroRemarcar("Não foi possível carregar as aulas dessa turma.")
      )
      .finally(() => setCarregandoAulasDestino(false));
  }

  function fecharModalRemarcar() {
    setModalRemarcarAberto(false);
    setAulasDaTurmaDestino([]);
    setAulaDestinoSelecionada(null);
    setAulaParaRemarcar(null);
    setErroRemarcar(null);
  }

  function abrirModalPlano() {
    setErroPlano(null);
    const idsDosPlanosAtivos = new Set(
      (aluno?.planos ?? []).filter((p) => p.ativo).map((p) => p.idPlano)
    );

    listarPlanos()
      .then((planos) =>
        setPlanosDisponiveis(
          (planos ?? []).filter((p) => !idsDosPlanosAtivos.has(p.id))
        )
      )
      .catch(() => setErroPlano("Não foi possível carregar os planos disponíveis."));
    setPlanoSelecionado("");
    setModalPlanoAberto(true);
  }

  function fecharModalPlano() {
    setModalPlanoAberto(false);
    setErroPlano(null);
  }

  function executarVincularPlano(event) {
    event.preventDefault();

    if (!planoSelecionado) {
      return;
    }

    setErroPlano(null);
    setVinculandoPlano(true);

    associarPlano(aluno.id, planoSelecionado)
      .then(() => {
        fecharModalPlano();
        carregarTudo();
      })
      .catch((erro) => {
        setErroPlano(
          erro.message ||
          "Não foi possível vincular o plano a este aluno."
        );
      })
      .finally(() => setVinculandoPlano(false));
  }

  function abrirModalTurma() {
    setErroVincularTurma(null);

    const idsDoAluno = new Set(turmasDoAluno.map((turma) => turma.id));

    listarTurmas()
      .then((turmas) => {
        setTurmasParaVincular(
          (turmas ?? []).filter(
            (turma) => turma.ativa && !idsDoAluno.has(turma.id)
          )
        );
      })
      .catch(() => {
        setErroVincularTurma(
          "Não foi possível carregar as turmas disponíveis."
        );
      });

    setTurmaParaVincularSelecionada("");
    setModalTurmaAberto(true);
  }

  function fecharModalTurma() {
    setModalTurmaAberto(false);
    setErroVincularTurma(null);
  }

  function executarVincularTurma(event) {
    event.preventDefault();

    if (!turmaParaVincularSelecionada) {
      return;
    }

    setErroVincularTurma(null);
    setVinculandoTurma(true);

    adicionarAlunoNaTurma(turmaParaVincularSelecionada, aluno.id)
      .then(() => {
        fecharModalTurma();
        carregarTudo();
      })
      .catch((erro) => {
        setErroVincularTurma(
          erro.message ||
          "Não foi possível vincular o aluno a essa turma."
        );
      })
      .finally(() => setVinculandoTurma(false));
  }

  function executarRemarcar(event) {
    event.preventDefault();
    if (!aulaDestinoSelecionada || !aulaParaRemarcar) return;

    if (String(aulaDestinoSelecionada.id) === String(aulaParaRemarcar.aulaId)) {
      setErroRemarcar(
        "Essa é a mesma aula que o aluno já tem marcada. Escolha outra data."
      );
      return;
    }

    setErroRemarcar(null);
    setRemarcando(true);
    registrarReposicao(aulaDestinoSelecionada.id, aluno.id, aulaParaRemarcar.aulaId)
      .then(() => {
        fecharModalRemarcar();
        carregarTudo();
      })
      .catch((erro) => {
        setErroRemarcar(
          erro.message || "Não foi possível remarcar a aula."
        );
      })
      .finally(() => setRemarcando(false));
  }

  const planoAtivo = aluno?.planos?.find((plano) => plano.ativo);

  // As aulas canceladas não aparecem na lista de compromissos.
  const aulasVisiveis = aulas.filter(
    (item) => item.status !== "CANCELADA"
  );

  return (
    <div className={styles["pagina-dados-aluno"]}>
      <Navbar />

      <div className={styles.conteudo}>
        <button
          className={styles["link-voltar"]}
          onClick={() => navigate("/alunos")}
        >
          <FiArrowLeft size={14} />
          Voltar para alunos
        </button>

        {erro && (
          <p className={styles["mensagem-erro"]}>{erro}</p>
        )}

        {carregando ? (
          <p className={styles["mensagem-info"]}>Carregando…</p>
        ) : !aluno ? (
          <p className={styles["mensagem-info"]}>
            Aluno não encontrado.
          </p>
        ) : (
          <>
            {acaoErro && (
              <p className={styles["mensagem-erro"]}>{acaoErro}</p>
            )}

            <div className={styles["cartao-perfil"]}>
              <div className={styles["avatar-perfil"]}>
                {aluno.nome.charAt(0).toUpperCase()}
              </div>

              <div className={styles["info-perfil"]}>
                <div className={styles["linha-nome"]}>
                  <h1 className={styles["nome-perfil"]}>
                    {aluno.nome}
                  </h1>

                  <span
                    className={`${styles.badge} ${aluno.ativo
                      ? styles.badgeAtivo
                      : styles.badgeInativo
                      }`}
                  >
                    {aluno.ativo ? "Ativo" : "Inativo"}
                  </span>

                  <button
                    className={styles["botao-editar-ficha"]}
                    onClick={abrirModalDados}
                  >
                    <FiEdit2 size={14} />
                    Editar dados
                  </button>
                </div>

                <div className={styles["grade-campos"]}>
                  <div className={styles["campo-editavel"]}>
                    <FiPhone size={16} />
                    <div>
                      <span className={styles["rotulo-campo-perfil"]}>
                        Telefone
                      </span>
                      <span className={styles["valor-campo-perfil"]}>
                        {aluno.telefone || "—"}
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
                        {aluno.email || "—"}
                      </span>
                    </div>
                  </div>

                  <div className={styles["campo-editavel"]}>
                    <FiCreditCard size={16} />
                    <div>
                      <span className={styles["rotulo-campo-perfil"]}>
                        CPF
                      </span>
                      <span className={styles["valor-campo-perfil"]}>
                        {aluno.cpf || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles["linha-plano-turma"]}>
                  <div className={styles["resumo-plano-turma"]}>
                    <span className={styles["item-resumo"]}>
                      <span className={styles["rotulo-resumo"]}>
                        Plano:
                      </span>{" "}
                      {planoAtivo ? (
                        <>
                          <Link
                            to="/planos"
                            className={styles["link-inline"]}
                          >
                            {planoAtivo.nome} ·{" "}
                            {planoAtivo.frequenciaSemanal}x/semana
                          </Link>
                          <span
                            className={styles["vencimento-plano"]}
                            title="Data de vencimento do plano"
                          >
                            {" "}
                            · vence em {formatarData(planoAtivo.dataFim)}
                          </span>
                        </>
                      ) : (
                        "Sem plano ativo"
                      )}
                    </span>

                    <span className={styles["item-resumo"]}>
                      <span className={styles["rotulo-resumo"]}>
                        Turma:
                      </span>

                      {turmasDoAluno.length > 0 ? (
                        <span className={styles["lista-turmas-aluno"]}>
                          {turmasDoAluno.map((turma) => (
                            <span
                              className={styles["chip-turma"]}
                              key={turma.id}
                            >
                              <Link
                                to={`/turmas/${turma.id}`}
                                className={styles["link-chip-turma"]}
                                title="Ver turma"
                              >
                                <FiUsers size={11} />
                                {formatarHorarioCurto(
                                  turma.diaSemana,
                                  turma.horaInicio
                                )}
                              </Link>

                              <button
                                className={styles["botao-cancelar-turma"]}
                                onClick={() =>
                                  executarCancelarTurma(turma)
                                }
                                disabled={
                                  cancelandoTurmaId === turma.id
                                }
                                title="Cancelar matrícula nessa turma"
                              >
                                <FiXCircle size={12} />
                              </button>
                            </span>
                          ))}
                        </span>
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>

                  <div className={styles["acoes-plano-turma"]}>
                    <button
                      className={styles["botao-acao-principal"]}
                      onClick={abrirModalPlano}
                      title="Vincular plano"
                    >
                      <FiPlus size={14} />
                      {planoAtivo ? "Trocar plano" : "Vincular plano"}
                    </button>

                    <button
                      className={styles["botao-acao-principal"]}
                      onClick={abrirModalTurma}
                      title="Vincular a uma nova turma"
                    >
                      <FiPlus size={14} />
                      Vincular turma
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles["cartao-ficha"]}>
              <div className={styles["cabecalho-secao"]}>
                <h2 className={styles["titulo-secao"]}>
                  Ficha de anamnese
                </h2>

                <button
                  className={styles["botao-editar-ficha"]}
                  onClick={abrirModalFicha}
                >
                  <FiEdit2 size={14} />
                  Editar
                </button>
              </div>

              <p className={styles["texto-ficha"]}>
                {aluno.fichaAnamnese ||
                  "Nenhuma informação registrada ainda."}
              </p>
            </div>

            <div className={styles["secao-aulas"]}>
              <div className={styles["cabecalho-secao"]}>
                <div>
                  <span className={styles["etiqueta-agenda"]}>
                    Agenda
                  </span>
                  <h2 className={styles["titulo-secao"]}>
                    Aulas agendadas
                  </h2>
                </div>
              </div>

              {aulasVisiveis.length === 0 ? (
                <p className={styles["mensagem-info"]}>
                  Nenhuma aula agendada nesta página.
                </p>
              ) : (
                <div className={styles["tabela-aulas"]}>
                  <div className={styles["linha-cabecalho-aulas"]}>
                    <span>Turma</span>
                    <span>Status</span>
                    <span>Data</span>
                    <span className={styles["coluna-acoes"]}>
                      Ações
                    </span>
                  </div>

                  {aulasVisiveis.map((item) => (
                    <div
                      className={styles["linha-aula"]}
                      key={item.id}
                    >
                      <span className={styles["turma-aula"]}>
                        {formatarHorario(
                          item.turmaDiaSemana,
                          item.turmaHoraInicio
                        )}
                      </span>

                      <span>
                        <span
                          className={`${styles.badgeStatus} ${styles[statusDaAula(item).estilo]
                            }`}
                        >
                          {statusDaAula(item).rotulo}
                        </span>
                      </span>

                      <span className={styles["data-aula"]}>
                        {formatarData(item.dataAula)}
                      </span>

                      <div className={styles["coluna-acoes"]}>
                        <button
                          className={styles["botao-remarcar"]}
                          onClick={() => abrirModalRemarcar(item)}
                          title="Remarcar (reposição)"
                        >
                          <FiRepeat size={14} />
                          Remarcar
                        </button>

                        <button
                          className={styles["botao-cancelar-aula"]}
                          onClick={() => executarCancelar(item)}
                          title="Cancelar"
                        >
                          <FiX size={14} />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Paginação: fica fora da tabela para continuar visível
                  mesmo quando todos os registros da página estão cancelados. */}
              {totalAulas > 0 && (
                <div className={styles["paginacao-aulas"]}>
                  <span className={styles["texto-paginacao-aulas"]}>
                    {totalAulas} aula(s) no total
                    {" · "}
                    Página {paginaAulas + 1} de{" "}
                    {Math.max(totalPaginasAulas, 1)}
                  </span>

                  <div className={styles["botoes-paginacao-aulas"]}>
                    <button
                      type="button"
                      onClick={() =>
                        irParaPaginaAulas(paginaAulas - 1)
                      }
                      disabled={paginaAulas === 0 || carregando}
                    >
                      Anterior
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        irParaPaginaAulas(paginaAulas + 1)
                      }
                      disabled={
                        carregando ||
                        totalPaginasAulas === 0 ||
                        paginaAulas >= totalPaginasAulas - 1
                      }
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles["cartao-perigo"]}>
              {aluno.ativo ? (
                <>
                  <div>
                    <p className={styles["titulo-perigo"]}>Inativar aluno</p>
                    <p className={styles["texto-perigo"]}>
                      O aluno deixa de aparecer como ativo, mas o histórico é
                      mantido.
                    </p>
                  </div>
                  <button
                    className={styles["botao-inativar-aluno"]}
                    onClick={executarInativar}
                  >
                    <FiUserX size={16} />
                    Inativar
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <p className={styles["titulo-perigo"]}>Reativar aluno</p>
                    <p className={styles["texto-perigo"]}>
                      Volta a aparecer como ativo. Plano e turmas não são
                      restaurados — matricule de novo se for o caso.
                    </p>
                  </div>
                  <button
                    className={styles["botao-inativar-aluno"]}
                    onClick={executarReativar}
                  >
                    <FiUserCheck size={16} />
                    Reativar
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {modalFichaAberto && (
        <div
          className={styles["fundo-modal"]}
          onClick={fecharModalFicha}
        >
          <div
            className={styles["caixa-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles["titulo-modal"]}>
              Editar ficha de anamnese
            </h2>

            {erroFicha && (
              <p className={styles["mensagem-erro"]}>{erroFicha}</p>
            )}

            <form onSubmit={executarSalvarFicha}>
              <div className={styles["grupo-campo"]}>
                <textarea
                  className={styles["textarea-modal"]}
                  rows={6}
                  value={ficha}
                  onChange={(e) => setFicha(e.target.value)}
                  placeholder="Histórico de saúde, restrições, observações..."
                />
              </div>

              <div className={styles["acoes-modal"]}>
                <button
                  type="button"
                  className={styles["botao-cancelar"]}
                  onClick={fecharModalFicha}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={styles["botao-salvar"]}
                  disabled={salvandoFicha}
                >
                  {salvandoFicha ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalDadosAberto && (
        <div
          className={styles["fundo-modal"]}
          onClick={fecharModalDados}
        >
          <div
            className={styles["caixa-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles["titulo-modal"]}>
              Editar dados do aluno
            </h2>

            {erroDados && (
              <p className={styles["mensagem-erro"]}>{erroDados}</p>
            )}

            <form onSubmit={executarSalvarDados}>
              <div className={styles["grupo-campo"]}>
                <label
                  className={styles["rotulo-campo"]}
                  htmlFor="nomeAluno"
                >
                  Nome
                </label>
                <input
                  id="nomeAluno"
                  className={styles["input-modal"]}
                  value={formDados.nome}
                  onChange={setValorFormDados("nome")}
                  required
                />
              </div>

              <div className={styles["grupo-campo"]}>
                <label
                  className={styles["rotulo-campo"]}
                  htmlFor="telefoneAluno"
                >
                  Telefone
                </label>
                <input
                  id="telefoneAluno"
                  className={styles["input-modal"]}
                  value={formDados.telefone}
                  onChange={setValorFormDados("telefone")}
                />
              </div>

              <div className={styles["grupo-campo"]}>
                <label
                  className={styles["rotulo-campo"]}
                  htmlFor="emailAluno"
                >
                  E-mail
                </label>
                <input
                  id="emailAluno"
                  type="email"
                  className={styles["input-modal"]}
                  value={formDados.email}
                  onChange={setValorFormDados("email")}
                  required
                />
              </div>

              <div className={styles["grupo-campo"]}>
                <label
                  className={styles["rotulo-campo"]}
                  htmlFor="cpfAluno"
                >
                  CPF
                </label>
                <input
                  id="cpfAluno"
                  className={styles["input-modal"]}
                  value={formDados.cpf}
                  onChange={setValorFormDados("cpf")}
                />
              </div>

              <div className={styles["grupo-campo"]}>
                <label
                  className={styles["rotulo-campo"]}
                  htmlFor="dataNascimentoAluno"
                >
                  Data de nascimento
                </label>
                <input
                  id="dataNascimentoAluno"
                  type="date"
                  className={styles["input-modal"]}
                  value={formDados.dataNascimento}
                  onChange={setValorFormDados("dataNascimento")}
                />
              </div>

              <div className={styles["acoes-modal"]}>
                <button
                  type="button"
                  className={styles["botao-cancelar"]}
                  onClick={fecharModalDados}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={styles["botao-salvar"]}
                  disabled={salvandoDados}
                >
                  {salvandoDados ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalRemarcarAberto && (
        <div
          className={styles["fundo-modal"]}
          onClick={fecharModalRemarcar}
        >
          <div
            className={styles["caixa-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles["titulo-modal"]}>
              Remarcar aula (reposição)
            </h2>

            <p className={styles["texto-explicativo-modal"]}>
              Escolha a turma e a data em que o aluno vai fazer a aula de
              reposição.
            </p>

            {erroRemarcar && (
              <p className={styles["mensagem-erro"]}>{erroRemarcar}</p>
            )}

            <form onSubmit={executarRemarcar}>
              <div className={styles["grupo-campo"]}>
                <label
                  className={styles["rotulo-campo"]}
                  htmlFor="turmaDestino"
                >
                  Turma de destino
                </label>

                <select
                  id="turmaDestino"
                  className={styles["input-modal"]}
                  value={turmaDestinoSelecionada}
                  onChange={(e) => selecionarTurmaDestino(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecione uma turma
                  </option>

                  {turmasDisponiveis.map((turma) => (
                    <option value={turma.id} key={turma.id}>
                      {formatarHorario(
                        turma.diaSemana,
                        turma.horaInicio
                      )}
                    </option>
                  ))}
                </select>
              </div>

              {turmaDestinoSelecionada && (
                <div className={styles["grupo-campo"]}>
                  <label className={styles["rotulo-campo"]}>Data da reposição</label>
                  {carregandoAulasDestino ? (
                    <p className={styles["mensagem-info"]}>Carregando datas…</p>
                  ) : (
                    <CalendarioMensal
                      aulas={aulasDaTurmaDestino}
                      aulaSelecionadaId={aulaDestinoSelecionada?.id}
                      onSelecionarAula={setAulaDestinoSelecionada}
                    />
                  )}
                </div>
              )}

              <div className={styles["acoes-modal"]}>
                <button
                  type="button"
                  className={styles["botao-cancelar"]}
                  onClick={fecharModalRemarcar}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={styles["botao-salvar"]}
                  disabled={remarcando || !aulaDestinoSelecionada}
                >
                  {remarcando ? "Remarcando…" : "Remarcar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalPlanoAberto && (
        <div
          className={styles["fundo-modal"]}
          onClick={fecharModalPlano}
        >
          <div
            className={styles["caixa-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles["titulo-modal"]}>Vincular plano</h2>

            {erroPlano && (
              <p className={styles["mensagem-erro"]}>{erroPlano}</p>
            )}

            <form onSubmit={executarVincularPlano}>
              <div className={styles["grupo-campo"]}>
                <label
                  className={styles["rotulo-campo"]}
                  htmlFor="plano"
                >
                  Plano
                </label>

                <select
                  id="plano"
                  className={styles["input-modal"]}
                  value={planoSelecionado}
                  onChange={(e) => setPlanoSelecionado(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecione um plano
                  </option>

                  {planosDisponiveis.map((plano) => (
                    <option value={plano.id} key={plano.id}>
                      {plano.nome} · {plano.frequenciaSemanal}x/semana ·
                      R$ {plano.valorMensal}/mês
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles["acoes-modal"]}>
                <button
                  type="button"
                  className={styles["botao-cancelar"]}
                  onClick={fecharModalPlano}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={styles["botao-salvar"]}
                  disabled={vinculandoPlano || !planoSelecionado}
                >
                  {vinculandoPlano ? "Vinculando…" : "Vincular"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalTurmaAberto && (
        <div
          className={styles["fundo-modal"]}
          onClick={fecharModalTurma}
        >
          <div
            className={styles["caixa-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles["titulo-modal"]}>
              Vincular a uma turma
            </h2>

            {erroVincularTurma && (
              <p className={styles["mensagem-erro"]}>
                {erroVincularTurma}
              </p>
            )}

            {turmasParaVincular.length === 0 &&
              !erroVincularTurma ? (
              <p className={styles["mensagem-info"]}>
                Não há turmas ativas disponíveis para vincular — o aluno
                já está em todas, ou nenhuma turma ativa foi cadastrada.
              </p>
            ) : (
              <form onSubmit={executarVincularTurma}>
                <div className={styles["grupo-campo"]}>
                  <label
                    className={styles["rotulo-campo"]}
                    htmlFor="turma"
                  >
                    Turma
                  </label>

                  <select
                    id="turma"
                    className={styles["input-modal"]}
                    value={turmaParaVincularSelecionada}
                    onChange={(e) =>
                      setTurmaParaVincularSelecionada(e.target.value)
                    }
                    required
                  >
                    <option value="" disabled>
                      Selecione uma turma
                    </option>

                    {turmasParaVincular.map((turma) => (
                      <option value={turma.id} key={turma.id}>
                        {formatarHorario(
                          turma.diaSemana,
                          turma.horaInicio
                        )}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles["acoes-modal"]}>
                  <button
                    type="button"
                    className={styles["botao-cancelar"]}
                    onClick={fecharModalTurma}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className={styles["botao-salvar"]}
                    disabled={
                      vinculandoTurma ||
                      !turmaParaVincularSelecionada
                    }
                  >
                    {vinculandoTurma ? "Vinculando…" : "Vincular"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {dialogoConfirmacao}
    </div>
  );
}
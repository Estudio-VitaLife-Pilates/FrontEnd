import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "./TurmaEspecifica.module.css";
import { Navbar } from "../../components/Navbar/Navbar";
import {
  buscarTurmaPorId,
  desativarTurma,
  trocarProfessorDaTurma,
  adicionarAlunoNaTurma,
  listarAlunosDaTurma,
  removerAlunoDaTurma,
  listarTurmas,
} from "../../api/turmas";
import {
  buscarProximasAulasDaTurma,
  buscarVagasDaAula,
  listarAlunosDaAula,
  removerAlunoDaAula,
  cancelarAulaDoAluno,
  registrarReposicao,
  buscarProximaAulaInfoDaTurma,
} from "../../api/aulas";
import { listarProfessores } from "../../api/professores";
import { listarAlunos } from "../../api/alunos";
import {
  FiArrowLeft,
  FiClock,
  FiUsers,
  FiRefreshCw,
  FiPhone,
  FiUserPlus,
  FiX,
  FiPower,
  FiChevronDown,
  FiRepeat,
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

const ROTULOS_STATUS = {
  AGENDADO: "Agendada",
  REPOSICAO: "Reposição",
  CANCELADA: "Cancelada",
  AUSENTE: "Ausente",
};

const ESTILO_STATUS = {
  AGENDADO: "badgeAgendada",
  REPOSICAO: "badgeReposicao",
  CANCELADA: "badgeCancelada",
  AUSENTE: "badgeAusente",
};

function statusDaAula(item) {
  const status = item.status;
  return {
    rotulo: ROTULOS_STATUS[status] ?? status ?? "—",
    estilo: ESTILO_STATUS[status] ?? "badgeAgendada",
  };
}

const INDICE_DIA_SEMANA = {
  DOMINGO: 0,
  SEGUNDA: 1,
  TERCA: 2,
  QUARTA: 3,
  QUINTA: 4,
  SEXTA: 5,
  SABADO: 6,
};

function formatarHorario(diaSemana, horaInicio) {
  const dia = NOMES_DIA_SEMANA[diaSemana] ?? diaSemana;
  const [hora, minuto] = (horaInicio ?? "00:00").split(":");
  const sufixo = minuto && minuto !== "00" ? `${hora}h${minuto}` : `${hora}h`;
  return `${dia}, ${sufixo}`;
}

function proximaData(diaSemana) {
  const alvo = INDICE_DIA_SEMANA[diaSemana];
  if (alvo === undefined) return "—";

  const hoje = new Date();
  const diasAte = (alvo - hoje.getDay() + 7) % 7;
  const data = new Date(hoje);
  data.setDate(hoje.getDate() + diasAte);

  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatarDataCompleta(dataAula) {
  const data = new Date(`${dataAula}T00:00:00`);
  return data.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export default function TurmaEspecifica() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [turma, setTurma] = useState(null);
  const [alunosMatriculados, setAlunosMatriculados] = useState([]);
  const [proximasOcorrencias, setProximasOcorrencias] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [modalProfessorAberto, setModalProfessorAberto] = useState(false);
  const [professorSelecionado, setProfessorSelecionado] = useState("");
  const [trocandoProfessor, setTrocandoProfessor] = useState(false);

  const [modalAlunoAberto, setModalAlunoAberto] = useState(false);
  const [alunosDisponiveis, setAlunosDisponiveis] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState("");
  const [adicionandoAluno, setAdicionandoAluno] = useState(false);
  const [erroAdicionarAluno, setErroAdicionarAluno] = useState(null);

  const [ocorrenciaAberta, setOcorrenciaAberta] = useState(null);
  const [alunosPorAula, setAlunosPorAula] = useState({});
  const [carregandoAlunosDaAula, setCarregandoAlunosDaAula] = useState(null);
  const [ocupacaoPorAula, setOcupacaoPorAula] = useState({});

  const [modalRemarcarAberto, setModalRemarcarAberto] = useState(false);
  const [aulaParaRemarcar, setAulaParaRemarcar] = useState(null);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState([]);
  const [turmaDestinoSelecionada, setTurmaDestinoSelecionada] = useState("");
  const [remarcando, setRemarcando] = useState(false);
  const [erroRemarcar, setErroRemarcar] = useState(null);

  useEffect(() => {
    carregarTudo();
  }, [id]);

  function carregarTudo() {
    setCarregando(true);
    setErro(null);

    Promise.all([
      buscarTurmaPorId(id),
      listarAlunosDaTurma(id),
      buscarProximasAulasDaTurma(id),
      listarProfessores(),
    ])
      .then(([dadosTurma, dadosTurmaComAlunos, dadosOcorrencias, dadosProfessores]) => {
        setTurma(dadosTurma);
        setAlunosMatriculados(
          (dadosTurmaComAlunos?.alunos ?? []).filter((a) => a.alunoTurmaAtivo)
        );
        setProximasOcorrencias(dadosOcorrencias ?? []);
        setProfessores(dadosProfessores ?? []);

        carregarOcupacaoDasOcorrencias(dadosOcorrencias ?? []);
      })
      .catch(() => setErro("Não foi possível carregar os dados da turma."))
      .finally(() => setCarregando(false));
  }

  function carregarOcupacaoDasOcorrencias(ocorrencias) {
    if (!ocorrencias.length) {
      setOcupacaoPorAula({});
      return;
    }

    Promise.all(
      ocorrencias.map((aula) =>
        buscarVagasDaAula(aula.id)
          .then((vagas) => [aula.id, vagas])
          .catch(() => [aula.id, null])
      )
    ).then((pares) => setOcupacaoPorAula(Object.fromEntries(pares)));
  }

  function executarDesativar() {
    if (!window.confirm("Desativar esta turma? Ela deixará de aparecer como ativa."))
      return;

    desativarTurma(id)
      .then(() => navigate("/turmas"))
      .catch(() => setErro("Não foi possível desativar a turma."));
  }

  function abrirModalProfessor() {
    setProfessorSelecionado("");
    setModalProfessorAberto(true);
  }

  function executarTrocarProfessor(event) {
    event.preventDefault();
    setTrocandoProfessor(true);

    trocarProfessorDaTurma(id, professorSelecionado)
      .then(() => {
        setModalProfessorAberto(false);
        carregarTudo();
      })
      .catch(() => setErro("Não foi possível trocar o professor."))
      .finally(() => setTrocandoProfessor(false));
  }

  function abrirModalAluno() {
    setErroAdicionarAluno(null);
    listarAlunos()
      .then((dados) => setAlunosDisponiveis(dados ?? []))
      .catch(() => setErroAdicionarAluno("Não foi possível carregar os alunos."));
    setAlunoSelecionado("");
    setModalAlunoAberto(true);
  }

  function fecharModalAluno() {
    setModalAlunoAberto(false);
    setErroAdicionarAluno(null);
  }

  function executarAdicionarAluno(event) {
    event.preventDefault();
    setErroAdicionarAluno(null);
    setAdicionandoAluno(true);

    adicionarAlunoNaTurma(id, Number(alunoSelecionado))
      .then(() => {
        setModalAlunoAberto(false);
        carregarTudo();
      })
      .catch((erro) =>
        setErroAdicionarAluno(
          erro.message || "Não foi possível adicionar o aluno à turma."
        )
      )
      .finally(() => setAdicionandoAluno(false));
  }

  function executarRemoverAlunoDaTurma(alunoId, nome) {
    if (
      !window.confirm(
        `Remover ${nome} desta turma? As próximas aulas dele nessa turma serão canceladas.`
      )
    )
      return;

    removerAlunoDaTurma(id, alunoId)
      .then(() => {
        setAlunosPorAula({});
        carregarTudo();
      })
      .catch(() => setErro("Não foi possível remover o aluno da turma."));
  }

  function executarRemoverAlunoDaAula(aulaAlunoId, nome, aulaId) {
    if (!window.confirm(`Remover ${nome} desta aula?`)) return;

    removerAlunoDaAula(aulaAlunoId)
      .then(() => {
        invalidarCacheDaAula(aulaId);
        carregarTudo();
      })
      .catch(() => setErro("Não foi possível remover o aluno."));
  }

  function invalidarCacheDaAula(aulaId) {
    if (!aulaId) return;
    setAlunosPorAula((atual) => {
      const copia = { ...atual };
      delete copia[aulaId];
      return copia;
    });

    if (ocorrenciaAberta === aulaId) {
      setCarregandoAlunosDaAula(aulaId);
      listarAlunosDaAula(aulaId)
        .then((dados) => {
          setAlunosPorAula((atual) => ({ ...atual, [aulaId]: dados ?? [] }));
        })
        .catch(() => setErro("Não foi possível atualizar os alunos dessa aula."))
        .finally(() => setCarregandoAlunosDaAula(null));
    }
  }

  function executarCancelarAulaAluno(aa, aulaId) {
    if (!window.confirm(`Cancelar a aula de ${aa.alunoNome} nesta data?`)) return;

    setErro(null);
    cancelarAulaDoAluno(aa.id)
      .then(() => {
        invalidarCacheDaAula(aulaId);
        carregarTudo();
      })
      .catch(() => setErro("Não foi possível cancelar a aula."));
  }

  function abrirModalRemarcar(aa, aulaId) {
    setErroRemarcar(null);
    listarTurmas()
      .then((turmas) => setTurmasDisponiveis((turmas ?? []).filter((t) => t.ativa)))
      .catch(() => setErroRemarcar("Não foi possível carregar as turmas disponíveis."));
    setAulaParaRemarcar({
      aulaAlunoId: aa.id,
      alunoId: aa.alunoId,
      alunoNome: aa.alunoNome,
      aulaOrigemId: aa.aulaId,
      aulaOrigemDaTurma: aulaId,
    });
    setTurmaDestinoSelecionada("");
    setModalRemarcarAberto(true);
  }

  function fecharModalRemarcar() {
    setModalRemarcarAberto(false);
    setAulaParaRemarcar(null);
    setErroRemarcar(null);
  }

  function executarRemarcar(event) {
    event.preventDefault();
    if (!turmaDestinoSelecionada || !aulaParaRemarcar) return;

    setErroRemarcar(null);
    setRemarcando(true);
    buscarProximaAulaInfoDaTurma(turmaDestinoSelecionada)
      .then((proximaAula) => {
        const aulaDestinoId = proximaAula?.id;

        if (!aulaDestinoId) {
          throw new Error(
            "Não foi possível encontrar a próxima aula dessa turma."
          );
        }

        if (String(aulaDestinoId) === String(aulaParaRemarcar.aulaOrigemId)) {
          throw new Error(
            "Essa é a mesma aula que o aluno já tem marcada. Escolha uma turma diferente para a reposição."
          );
        }

        return registrarReposicao(
          aulaDestinoId,
          aulaParaRemarcar.alunoId,
          aulaParaRemarcar.aulaOrigemId
        );
      })
      .then(() => {
        invalidarCacheDaAula(aulaParaRemarcar.aulaOrigemDaTurma);
        fecharModalRemarcar();
        carregarTudo();
      })
      .catch((erro) =>
        setErroRemarcar(
          erro.message ||
            "Não foi possível remarcar a aula. A turma escolhida pode não ter uma próxima aula definida."
        )
      )
      .finally(() => setRemarcando(false));
  }

  function alternarOcorrencia(aulaId) {
    if (ocorrenciaAberta === aulaId) {
      setOcorrenciaAberta(null);
      return;
    }

    setOcorrenciaAberta(aulaId);

    if (!alunosPorAula[aulaId]) {
      setCarregandoAlunosDaAula(aulaId);
      listarAlunosDaAula(aulaId)
        .then((dados) => {
          setAlunosPorAula((atual) => ({ ...atual, [aulaId]: dados ?? [] }));
        })
        .catch(() => setErro("Não foi possível carregar os alunos dessa aula."))
        .finally(() => setCarregandoAlunosDaAula(null));
    }
  }

  const vagasProximaAula = ocupacaoPorAula[proximasOcorrencias[0]?.id];
  const ocupados =
    turma && vagasProximaAula !== undefined && vagasProximaAula !== null
      ? turma.capacidadeMax - vagasProximaAula
      : null;
  const percentualOcupacao =
    ocupados !== null && turma ? Math.round((ocupados / turma.capacidadeMax) * 100) : 0;

  return (
    <div className={styles["pagina-turma"]}>
      <Navbar />

      <div className={styles.conteudo}>
        <button className={styles["link-voltar"]} onClick={() => navigate("/turmas")}>
          <FiArrowLeft size={14} />
          Voltar para Turmas
        </button>

        {erro && <p className={styles["mensagem-erro"]}>{erro}</p>}

        {carregando ? (
          <p className={styles["mensagem-info"]}>Carregando…</p>
        ) : !turma ? (
          <p className={styles["mensagem-info"]}>Turma não encontrada.</p>
        ) : (
          <>
            <div className={styles["linha-topo"]}>
              <div className={styles["cartao-turma"]}>
                <span className={styles["etiqueta-info"]}>
                  Informações da próxima aula
                </span>
                <h1 className={styles["titulo-turma"]}>
                  {formatarHorario(turma.diaSemana, turma.horaInicio)}
                </h1>
                <p className={styles["texto-proxima"]}>
                  Próxima aula: <strong>{proximaData(turma.diaSemana)}</strong>
                </p>

                <div className={styles["grade-detalhes"]}>
                  <div>
                    <span className={styles["rotulo-detalhe"]}>Duração</span>
                    <span className={styles["valor-detalhe"]}>
                      <FiClock size={14} />
                      {turma.duracaoMinutos} min
                    </span>
                  </div>
                  <div>
                    <span className={styles["rotulo-detalhe"]}>
                      Capacidade máxima
                    </span>
                    <span className={styles["valor-detalhe"]}>
                      <FiUsers size={14} />
                      {turma.capacidadeMax} alunos
                    </span>
                  </div>
                </div>

                <div className={styles["bloco-ocupacao"]}>
                  <div className={styles["linha-ocupacao"]}>
                    <span>
                      Ocupação: <strong>{ocupados}/{turma.capacidadeMax}</strong>
                    </span>
                    <span className={styles["percentual-ocupacao"]}>
                      {percentualOcupacao}%
                    </span>
                  </div>
                  <div className={styles["barra-ocupacao"]}>
                    <div
                      className={styles["barra-ocupacao-preenchida"]}
                      style={{ width: `${percentualOcupacao}%` }}
                    />
                  </div>
                </div>

                <div className={styles["linha-acoes-turma"]}>
                  <span
                    className={`${styles.badge} ${
                      turma.ativa ? styles.badgeAtiva : styles.badgeInativa
                    }`}
                  >
                    {turma.ativa ? "Ativa" : "Inativa"}
                  </span>
                  {turma.ativa && (
                    <button
                      className={styles["botao-desativar"]}
                      onClick={executarDesativar}
                    >
                      <FiPower size={12} />
                      Desativar turma
                    </button>
                  )}
                </div>
              </div>

              <div className={styles["cartao-professor"]}>
                <div className={styles["cabecalho-professor"]}>
                  <span className={styles["etiqueta-info"]}>Professor(a)</span>
                  <button
                    className={styles["botao-trocar"]}
                    onClick={abrirModalProfessor}
                  >
                    <FiRefreshCw size={12} />
                    Trocar
                  </button>
                </div>

                <div className={styles["info-professor"]}>
                  <div className={styles["avatar-professor"]}>
                    {(turma.professorNome ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={styles["nome-professor"]}>
                      {turma.professorNome ?? "Sem professor"}
                    </p>
                  </div>
                </div>

                <div className={styles["bloco-proxima-aula"]}>
                  <span className={styles["rotulo-detalhe"]}>Próxima aula</span>
                  <p className={styles["valor-proxima-aula"]}>
                    {formatarHorario(turma.diaSemana, turma.horaInicio)} ·{" "}
                    {proximaData(turma.diaSemana)}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles["secao-alunos"]}>
              <div className={styles["cabecalho-secao"]}>
                <div className={styles["titulo-com-contagem"]}>
                  <FiUsers size={16} />
                  <h2 className={styles["titulo-secao"]}>Alunos</h2>
                  <span className={styles["contagem-alunos"]}>
                    {alunosMatriculados.length}/{turma.capacidadeMax}
                  </span>
                </div>
                <button className={styles["botao-adicionar"]} onClick={abrirModalAluno}>
                  <FiUserPlus size={16} />
                  Adicionar aluno
                </button>
              </div>

              {alunosMatriculados.length === 0 ? (
                <p className={styles["mensagem-info"]}>
                  Nenhum aluno matriculado nessa turma ainda.
                </p>
              ) : (
                <div className={styles["tabela-alunos"]}>
                  <div className={styles["linha-cabecalho-alunos"]}>
                    <span>Nome</span>
                    <span>Matriculado desde</span>
                    <span>Telefone</span>
                    <span className={styles["coluna-acoes"]}>Ações</span>
                  </div>

                  {alunosMatriculados.map((aluno) => (
                    <div className={styles["linha-aluno"]} key={aluno.id}>
                      <Link
                        to={`/alunos/${aluno.id}`}
                        className={styles["nome-com-avatar"]}
                      >
                        <div className={styles["avatar-aluno"]}>
                          {aluno.nome
                            .split(" ")
                            .slice(0, 2)
                            .map((p) => p.charAt(0).toUpperCase())
                            .join("")}
                        </div>
                        <span>{aluno.nome}</span>
                      </Link>
                      <span className={styles["status-normal"]}>
                        {aluno.dataInicio
                          ? new Date(`${aluno.dataInicio}T00:00:00`).toLocaleDateString("pt-BR")
                          : "—"}
                      </span>
                      <span className={styles["telefone-aluno"]}>
                        <FiPhone size={14} />
                        {aluno.telefone}
                      </span>
                      <div className={styles["coluna-acoes"]}>
                        <button
                          className={styles["botao-remover-aluno"]}
                          onClick={() => executarRemoverAlunoDaTurma(aluno.id, aluno.nome)}
                          aria-label={`Remover ${aluno.nome}`}
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles["secao-ocorrencias"]}>
              <div className={styles["cabecalho-secao"]}>
                <div className={styles["titulo-com-contagem"]}>
                  <FiClock size={16} />
                  <h2 className={styles["titulo-secao"]}>Próximas ocorrências</h2>
                </div>
              </div>

              {proximasOcorrencias.length === 0 ? (
                <p className={styles["mensagem-info"]}>
                  Nenhuma próxima aula gerada ainda para esta turma.
                </p>
              ) : (
                <div className={styles["lista-ocorrencias"]}>
                  {proximasOcorrencias.map((aula) => {
                    const aberta = ocorrenciaAberta === aula.id;
                    const alunosDaAula = (alunosPorAula[aula.id] ?? []).filter(
                      (aa) => aa.status !== "CANCELADA"
                    );
                    const alunosCarregados = alunosPorAula[aula.id] !== undefined;
                    const carregandoEssa = carregandoAlunosDaAula === aula.id;
                    const ocupacao = ocupacaoPorAula[aula.id];

                    return (
                      <div className={styles["cartao-ocorrencia"]} key={aula.id}>
                        <button
                          type="button"
                          className={styles["item-ocorrencia"]}
                          onClick={() => alternarOcorrencia(aula.id)}
                          aria-expanded={aberta}
                        >
                          <span className={styles["data-com-icone"]}>
                            <FiClock size={14} />
                            <span className={styles["data-ocorrencia"]}>
                              {formatarDataCompleta(aula.dataAula)}
                            </span>
                          </span>
                          <span className={styles["ocupacao-ocorrencia"]}>
                            {ocupacao !== undefined && ocupacao !== null && turma && (
                              <span className={styles["badge-ocupacao"]}>
                                {turma.capacidadeMax - ocupacao}/{turma.capacidadeMax}
                              </span>
                            )}
                            <FiChevronDown
                              size={16}
                              className={`${styles["icone-expandir"]} ${
                                aberta ? styles["icone-expandir-aberto"] : ""
                              }`}
                            />
                          </span>
                        </button>

                        {aberta && (
                          <div className={styles["conteudo-ocorrencia"]}>
                            {carregandoEssa ? (
                              <p className={styles["mensagem-info"]}>Carregando alunos…</p>
                            ) : !alunosCarregados || alunosDaAula.length === 0 ? (
                              <p className={styles["mensagem-info"]}>
                                Nenhum aluno confirmado nessa aula ainda.
                              </p>
                            ) : (
                              <div className={styles["tabela-alunos"]}>
                                <div className={styles["linha-cabecalho-alunos"]}>
                                  <span>Nome</span>
                                  <span>Status</span>
                                  <span>Telefone</span>
                                  <span className={styles["coluna-acoes"]}>Ações</span>
                                </div>

                                {alunosDaAula.map((aa) => (
                                  <div className={styles["linha-aluno"]} key={aa.id}>
                                    <Link
                                      to={`/alunos/${aa.alunoId}`}
                                      className={styles["nome-com-avatar"]}
                                    >
                                      <div className={styles["avatar-aluno"]}>
                                        {aa.alunoNome
                                          .split(" ")
                                          .slice(0, 2)
                                          .map((p) => p.charAt(0).toUpperCase())
                                          .join("")}
                                      </div>
                                      <span>{aa.alunoNome}</span>
                                    </Link>
                                    <span>
                                      <span
                                        className={`${styles.badgeStatus} ${
                                          styles[statusDaAula(aa).estilo]
                                        }`}
                                      >
                                        {statusDaAula(aa).rotulo}
                                      </span>
                                    </span>
                                    <span className={styles["telefone-aluno"]}>
                                      <FiPhone size={14} />
                                      {aa.alunoTelefone}
                                    </span>
                                    <div className={styles["coluna-acoes"]}>
                                      <button
                                        className={styles["botao-remarcar"]}
                                        onClick={() => abrirModalRemarcar(aa, aula.id)}
                                        title="Remarcar (reposição)"
                                        aria-label={`Remarcar ${aa.alunoNome}`}
                                      >
                                        <FiRepeat size={14} />
                                      </button>
                                      <button
                                        className={styles["botao-cancelar-aula"]}
                                        onClick={() => executarCancelarAulaAluno(aa, aula.id)}
                                        title="Cancelar"
                                        aria-label={`Cancelar aula de ${aa.alunoNome}`}
                                      >
                                        <FiX size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {modalProfessorAberto && (
        <div
          className={styles["fundo-modal"]}
          onClick={() => setModalProfessorAberto(false)}
        >
          <div className={styles["caixa-modal"]} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles["titulo-modal"]}>Trocar professor</h2>
            <form onSubmit={executarTrocarProfessor}>
              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="professor">
                  Novo professor
                </label>
                <select
                  id="professor"
                  className={styles["input-modal"]}
                  value={professorSelecionado}
                  onChange={(e) => setProfessorSelecionado(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecione um professor
                  </option>
                  {professores
                    .filter((p) => String(p.id) !== String(turma?.professorId))
                    .map((p) => (
                      <option value={p.id} key={p.id}>
                        {p.nome}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles["acoes-modal"]}>
                <button
                  type="button"
                  className={styles["botao-cancelar"]}
                  onClick={() => setModalProfessorAberto(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles["botao-salvar"]}
                  disabled={trocandoProfessor || !professorSelecionado}
                >
                  {trocandoProfessor ? "Trocando…" : "Trocar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalRemarcarAberto && (
        <div className={styles["fundo-modal"]} onClick={fecharModalRemarcar}>
          <div className={styles["caixa-modal"]} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles["titulo-modal"]}>Remarcar aula (reposição)</h2>
            <p className={styles["texto-explicativo-modal"]}>
              Escolha a turma em que {aulaParaRemarcar?.alunoNome} vai fazer a
              aula de reposição. A vaga será na próxima aula dessa turma — se
              ainda não existir nenhuma aula futura marcada, ela será criada
              automaticamente.
            </p>

            {erroRemarcar && (
              <p className={styles["mensagem-erro"]}>{erroRemarcar}</p>
            )}

            <form onSubmit={executarRemarcar}>
              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="turmaDestino">
                  Turma de destino
                </label>
                <select
                  id="turmaDestino"
                  className={styles["input-modal"]}
                  value={turmaDestinoSelecionada}
                  onChange={(e) => setTurmaDestinoSelecionada(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecione uma turma
                  </option>
                  {turmasDisponiveis.map((t) => (
                    <option value={t.id} key={t.id}>
                      {formatarHorario(t.diaSemana, t.horaInicio)}
                    </option>
                  ))}
                </select>
              </div>

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
                  disabled={remarcando || !turmaDestinoSelecionada}
                >
                  {remarcando ? "Remarcando…" : "Remarcar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalAlunoAberto && (
        <div className={styles["fundo-modal"]} onClick={fecharModalAluno}>
          <div className={styles["caixa-modal"]} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles["titulo-modal"]}>Adicionar aluno</h2>

            {erroAdicionarAluno && (
              <p className={styles["mensagem-erro"]}>{erroAdicionarAluno}</p>
            )}

            <form onSubmit={executarAdicionarAluno}>
              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="aluno">
                  Aluno
                </label>
                <select
                  id="aluno"
                  className={styles["input-modal"]}
                  value={alunoSelecionado}
                  onChange={(e) => setAlunoSelecionado(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecione um aluno
                  </option>
                  {alunosDisponiveis.map((aluno) => (
                    <option value={aluno.id} key={aluno.id}>
                      {aluno.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles["acoes-modal"]}>
                <button
                  type="button"
                  className={styles["botao-cancelar"]}
                  onClick={fecharModalAluno}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles["botao-salvar"]}
                  disabled={adicionandoAluno || !alunoSelecionado}
                >
                  {adicionandoAluno ? "Adicionando…" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

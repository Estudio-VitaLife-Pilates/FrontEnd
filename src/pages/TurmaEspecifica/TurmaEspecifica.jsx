import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./TurmaEspecifica.module.css";
import { Navbar } from "../../components/Navbar/Navbar";
import {
  buscarTurmaPorId,
  buscarVagasTurma,
  desativarTurma,
  trocarProfessorDaTurma,
  adicionarAlunoNaTurma,
} from "../../api/turmas";
import {
  buscarAlunosProximaAulaDaTurma,
  removerAlunoDaAula,
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

export default function TurmaEspecifica() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [turma, setTurma] = useState(null);
  const [vagas, setVagas] = useState(null);
  const [alunosProximaAula, setAlunosProximaAula] = useState([]);
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

  useEffect(() => {
    carregarTudo();
  }, [id]);

  function carregarTudo() {
    setCarregando(true);
    setErro(null);

    Promise.all([
      buscarTurmaPorId(id),
      buscarVagasTurma(id),
      buscarAlunosProximaAulaDaTurma(id),
      listarProfessores(),
    ])
      .then(([dadosTurma, dadosVagas, dadosAlunos, dadosProfessores]) => {
        setTurma(dadosTurma);
        setVagas(dadosVagas);
        setAlunosProximaAula(dadosAlunos ?? []);
        setProfessores(dadosProfessores ?? []);
      })
      .catch(() => setErro("Não foi possível carregar os dados da turma."))
      .finally(() => setCarregando(false));
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
    listarAlunos()
      .then((dados) => setAlunosDisponiveis(dados ?? []))
      .catch(() => setErro("Não foi possível carregar os alunos."));
    setAlunoSelecionado("");
    setModalAlunoAberto(true);
  }

  function executarAdicionarAluno(event) {
    event.preventDefault();
    setAdicionandoAluno(true);

    adicionarAlunoNaTurma(id, Number(alunoSelecionado))
      .then(() => {
        setModalAlunoAberto(false);
        carregarTudo();
      })
      .catch(() => setErro("Não foi possível adicionar o aluno à turma."))
      .finally(() => setAdicionandoAluno(false));
  }

  function executarRemoverAluno(aulaAlunoId, nome) {
    if (!window.confirm(`Remover ${nome} desta aula?`)) return;

    removerAlunoDaAula(aulaAlunoId)
      .then(carregarTudo)
      .catch(() => setErro("Não foi possível remover o aluno."));
  }

  const ocupados =
    turma && vagas !== null ? turma.capacidadeMax - vagas : null;
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
                    {ocupados}/{turma.capacidadeMax}
                  </span>
                </div>
                <button className={styles["botao-adicionar"]} onClick={abrirModalAluno}>
                  <FiUserPlus size={16} />
                  Adicionar aluno
                </button>
              </div>

              {alunosProximaAula.length === 0 ? (
                <p className={styles["mensagem-info"]}>
                  Nenhum aluno confirmado para a próxima aula ainda.
                </p>
              ) : (
                <div className={styles["tabela-alunos"]}>
                  <div className={styles["linha-cabecalho-alunos"]}>
                    <span>Nome</span>
                    <span>Status</span>
                    <span>Telefone</span>
                    <span className={styles["coluna-acoes"]}>Ações</span>
                  </div>

                  {alunosProximaAula.map((aa) => (
                    <div className={styles["linha-aluno"]} key={aa.id}>
                      <div className={styles["nome-com-avatar"]}>
                        <div className={styles["avatar-aluno"]}>
                          {aa.alunoNome
                            .split(" ")
                            .slice(0, 2)
                            .map((p) => p.charAt(0).toUpperCase())
                            .join("")}
                        </div>
                        <span>{aa.alunoNome}</span>
                      </div>
                      <span>
                        {aa.reposicao ? (
                          <span className={styles["badge-reposicao"]}>Reposição</span>
                        ) : (
                          <span className={styles["status-normal"]}>—</span>
                        )}
                      </span>
                      <span className={styles["telefone-aluno"]}>
                        <FiPhone size={14} />
                        {aa.alunoTelefone}
                      </span>
                      <div className={styles["coluna-acoes"]}>
                        <button
                          className={styles["botao-remover-aluno"]}
                          onClick={() => executarRemoverAluno(aa.id, aa.alunoNome)}
                          aria-label={`Remover ${aa.alunoNome}`}
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
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

      {modalAlunoAberto && (
        <div className={styles["fundo-modal"]} onClick={() => setModalAlunoAberto(false)}>
          <div className={styles["caixa-modal"]} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles["titulo-modal"]}>Adicionar aluno</h2>
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
                  onClick={() => setModalAlunoAberto(false)}
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

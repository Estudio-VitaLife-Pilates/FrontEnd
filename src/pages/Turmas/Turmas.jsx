import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Turmas.module.css";
import { Navbar } from "../../components/Navbar/Navbar";
import {
  buscarVagasTurma,
  cadastrarTurma,
  listarTurmas,
} from "../../api/turmas";
import { listarProfessores } from "../../api/professores";
import { FiPlus, FiSearch } from "react-icons/fi";

const DIAS_SEMANA = [
  "SEGUNDA",
  "TERCA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SABADO",
  "DOMINGO",
];

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

const FORM_VAZIO = {
  diaSemana: "SEGUNDA",
  horaInicio: "08:00",
  duracaoMinutos: 60,
  capacidadeMax: 10,
  professorId: "",
  ativa: true,
};

export default function Turmas() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [busca, setBusca] = useState("");
  const [filtroDia, setFiltroDia] = useState("");
  const [filtroProfessor, setFiltroProfessor] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarTudo();
  }, []);

  function carregarTudo() {
    setCarregando(true);
    setErro(null);

    Promise.all([listarTurmas(), listarProfessores()])
      .then(([dadosTurmas, dadosProfessores]) => {
        setProfessores(dadosProfessores ?? []);
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
      .catch(() => setErro("Não foi possível carregar as turmas."))
      .finally(() => setCarregando(false));
  }

  const turmasFiltradas = useMemo(() => {
    const buscaMinuscula = busca.toLowerCase();
    return turmas.filter((turma) => {
      const horario = formatarHorario(turma.diaSemana, turma.horaInicio).toLowerCase();
      const bateBusca = !busca || horario.includes(buscaMinuscula);
      const bateDia = !filtroDia || turma.diaSemana === filtroDia;
      const bateProfessor =
        !filtroProfessor || String(turma.professorId) === String(filtroProfessor);
      return bateBusca && bateDia && bateProfessor;
    });
  }, [turmas, busca, filtroDia, filtroProfessor]);

  const totalTurmas = turmas.length;
  const totalAtivas = turmas.filter((t) => t.ativa).length;
  const totalInativas = totalTurmas - totalAtivas;
  const totalAlunos = turmas.reduce(
    (soma, t) => soma + (t.alunosMatriculados ?? 0),
    0
  );

  const grupos = useMemo(() => {
    const mapa = new Map();
    for (const turma of turmasFiltradas) {
      const chave = turma.professorNome ?? "Sem professor";
      if (!mapa.has(chave)) mapa.set(chave, []);
      mapa.get(chave).push(turma);
    }
    return [...mapa.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [turmasFiltradas]);

  function abrirModal() {
    setForm(FORM_VAZIO);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  function setValorCampo(campo) {
    return (event) => {
      const valor =
        event.target.type === "checkbox" ? event.target.checked : event.target.value;
      setForm((atual) => ({ ...atual, [campo]: valor }));
    };
  }

  function executarCadastro(event) {
    event.preventDefault();
    setEnviando(true);

    cadastrarTurma({
      diaSemana: form.diaSemana,
      horaInicio: form.horaInicio,
      duracaoMinutos: Number(form.duracaoMinutos),
      capacidadeMax: Number(form.capacidadeMax),
      ativa: form.ativa,
      professorId: Number(form.professorId),
    })
      .then(() => {
        fecharModal();
        carregarTudo();
      })
      .catch(() => setErro("Não foi possível cadastrar a turma."))
      .finally(() => setEnviando(false));
  }

  return (
    <div className={styles["pagina-turmas"]}>
      <Navbar />

      <div className={styles.conteudo}>
        <div className={styles["cabecalho-pagina"]}>
          <div>
            <span className={styles["etiqueta-agenda"]}>Agenda</span>
            <h1 className={styles["titulo-pagina"]}>Turmas</h1>
          </div>
          <button className={styles["botao-cadastrar"]} onClick={abrirModal}>
            <FiPlus size={16} />
            Cadastrar turma
          </button>
        </div>

        {erro && <p className={styles["mensagem-erro"]}>{erro}</p>}

        {carregando ? (
          <p className={styles["mensagem-info"]}>Carregando turmas…</p>
        ) : (
          <>
            <div className={styles["grade-kpi"]}>
              <div className={styles["cartao-kpi"]}>
                <span className={styles["rotulo-kpi"]}>Total de turmas</span>
                <span className={styles["valor-kpi"]}>{totalTurmas}</span>
                <span className={styles["legenda-kpi"]}>cadastradas no studio</span>
              </div>
              <div className={styles["cartao-kpi"]}>
                <span className={styles["rotulo-kpi"]}>Turmas ativas</span>
                <span className={styles["valor-kpi"]}>{totalAtivas}</span>
                <span className={styles["legenda-kpi"]}>em funcionamento</span>
              </div>
              <div className={styles["cartao-kpi"]}>
                <span className={styles["rotulo-kpi"]}>Turmas inativas</span>
                <span className={styles["valor-kpi"]}>{totalInativas}</span>
                <span className={styles["legenda-kpi"]}>pausadas ou encerradas</span>
              </div>
              <div className={styles["cartao-kpi"]}>
                <span className={styles["rotulo-kpi"]}>Total de alunos</span>
                <span className={styles["valor-kpi"]}>{totalAlunos}</span>
                <span className={styles["legenda-kpi"]}>em todas as turmas</span>
              </div>
            </div>

            <div className={styles["barra-filtros"]}>
              <div className={styles["grupo-campo-filtro"]}>
                <label className={styles["rotulo-busca"]} htmlFor="busca">
                  Busca por turma
                </label>
                <div className={styles["container-busca"]}>
                  <FiSearch size={16} className={styles["icone-busca"]} />
                  <input
                    id="busca"
                    className={styles["input-busca"]}
                    placeholder="Ex: Segunda, 10h"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles["grupo-campo-filtro"]}>
                <label className={styles["rotulo-busca"]} htmlFor="filtroDia">
                  Dia da semana
                </label>
                <select
                  id="filtroDia"
                  className={styles["select-filtro"]}
                  value={filtroDia}
                  onChange={(e) => setFiltroDia(e.target.value)}
                >
                  <option value="">Todos</option>
                  {DIAS_SEMANA.map((dia) => (
                    <option value={dia} key={dia}>
                      {NOMES_DIA_SEMANA[dia]}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles["grupo-campo-filtro"]}>
                <label className={styles["rotulo-busca"]} htmlFor="filtroProfessor">
                  Professor
                </label>
                <select
                  id="filtroProfessor"
                  className={styles["select-filtro"]}
                  value={filtroProfessor}
                  onChange={(e) => setFiltroProfessor(e.target.value)}
                >
                  <option value="">Todos</option>
                  {professores.map((professor) => (
                    <option value={professor.id} key={professor.id}>
                      {professor.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {grupos.length === 0 ? (
              <p className={styles["mensagem-info"]}>
                Nenhuma turma encontrada.
              </p>
            ) : (
              grupos.map(([nomeProfessor, itens]) => (
                <div className={styles["grupo-professor"]} key={nomeProfessor}>
                  <div className={styles["cabecalho-grupo"]}>
                    <h2 className={styles["titulo-grupo"]}>{nomeProfessor}</h2>
                    <span className={styles["contagem-grupo"]}>
                      {itens.length} {itens.length === 1 ? "turma" : "turmas"}
                    </span>
                  </div>

                  <div className={styles["tabela-turmas"]}>
                    <div className={styles["linha-cabecalho-turmas"]}>
                      <span>Semana / Horário</span>
                      <span>Próxima aula</span>
                      <span>Duração</span>
                      <span className={styles["coluna-central"]}>Alunos</span>
                      <span className={styles["coluna-central"]}>Status</span>
                    </div>

                    {itens.map((turma) => (
                      <div
                        className={styles["linha-turma"]}
                        key={turma.id}
                        onClick={() => navigate(`/turmas/${turma.id}`)}
                        role="button"
                        tabIndex={0}
                      >
                        <span className={styles["nome-turma"]}>
                          {formatarHorario(turma.diaSemana, turma.horaInicio)}
                        </span>
                        <span className={styles["proxima-aula"]}>
                          {proximaData(turma.diaSemana)}
                        </span>
                        <span className={styles["duracao-turma"]}>
                          {turma.duracaoMinutos}min
                        </span>
                        <span className={styles["alunos-turma"]}>
                          {turma.alunosMatriculados}/{turma.capacidadeMax}
                        </span>
                        <span className={styles["coluna-central"]}>
                          <span
                            className={`${styles.badge} ${
                              turma.ativa ? styles.badgeAtiva : styles.badgeInativa
                            }`}
                          >
                            {turma.ativa ? "Ativa" : "Inativa"}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {modalAberto && (
        <div className={styles["fundo-modal"]} onClick={fecharModal}>
          <div className={styles["caixa-modal"]} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles["titulo-modal"]}>Cadastrar turma</h2>

            <form onSubmit={executarCadastro}>
              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="diaSemana">
                  Dia da semana
                </label>
                <select
                  id="diaSemana"
                  className={styles["input-modal"]}
                  value={form.diaSemana}
                  onChange={setValorCampo("diaSemana")}
                >
                  {DIAS_SEMANA.map((dia) => (
                    <option value={dia} key={dia}>
                      {NOMES_DIA_SEMANA[dia]}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="horaInicio">
                  Horário de início
                </label>
                <input
                  id="horaInicio"
                  type="time"
                  className={styles["input-modal"]}
                  value={form.horaInicio}
                  onChange={setValorCampo("horaInicio")}
                  required
                />
              </div>

              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="duracaoMinutos">
                  Duração (minutos)
                </label>
                <input
                  id="duracaoMinutos"
                  type="number"
                  min="1"
                  className={styles["input-modal"]}
                  value={form.duracaoMinutos}
                  onChange={setValorCampo("duracaoMinutos")}
                  required
                />
              </div>

              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="capacidadeMax">
                  Capacidade máxima
                </label>
                <input
                  id="capacidadeMax"
                  type="number"
                  min="1"
                  className={styles["input-modal"]}
                  value={form.capacidadeMax}
                  onChange={setValorCampo("capacidadeMax")}
                  required
                />
              </div>

              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="professorId">
                  Professor
                </label>
                <select
                  id="professorId"
                  className={styles["input-modal"]}
                  value={form.professorId}
                  onChange={setValorCampo("professorId")}
                  required
                >
                  <option value="" disabled>
                    Selecione um professor
                  </option>
                  {professores.map((professor) => (
                    <option value={professor.id} key={professor.id}>
                      {professor.nome}
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

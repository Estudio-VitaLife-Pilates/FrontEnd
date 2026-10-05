import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./VisaoGeral.module.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { listarAlunos } from "../../api/alunos";
import { listarTurmas } from "../../api/turmas";
import { listarPlanosDetalhado } from "../../api/planos";
import { buscarProximasAulasDaTurma, buscarVagasDaAula } from "../../api/aulas";
import {
  FiUsers,
  FiLayers,
  FiDollarSign,
  FiClock,
  FiTrendingUp,
  FiAlertTriangle,
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

function formatarMoeda(valor) {
  return (valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function hojeISO() {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function dataDeHojeFormatada() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function carregarAgendaDoDia(turmas) {
  const hoje = hojeISO();
  const turmasAtivas = turmas.filter((t) => t.ativa);

  return Promise.all(
    turmasAtivas.map((turma) =>
      buscarProximasAulasDaTurma(turma.id)
        .then((aulas) => (aulas ?? []).find((a) => a.dataAula === hoje))
        .then((aulaHoje) => {
          if (!aulaHoje) return null;
          return buscarVagasDaAula(aulaHoje.id)
            .then((vagas) => ({
              turma,
              aula: aulaHoje,
              ocupados:
                vagas === null || vagas === undefined
                  ? null
                  : turma.capacidadeMax - vagas,
            }))
            .catch(() => ({ turma, aula: aulaHoje, ocupados: null }));
        })
        .catch(() => null)
    )
  ).then((itens) =>
    itens
      .filter(Boolean)
      .sort((a, b) => (a.turma.horaInicio ?? "").localeCompare(b.turma.horaInicio ?? ""))
  );
}

export default function VisaoGeral() {
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [agendaDoDia, setAgendaDoDia] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarTudo();
  }, []);

  function carregarTudo() {
    setCarregando(true);
    setErro(null);

    Promise.all([listarAlunos(), listarTurmas(), listarPlanosDetalhado()])
      .then(([dadosAlunos, dadosTurmas, dadosPlanos]) => {
        setAlunos(dadosAlunos ?? []);
        setTurmas(dadosTurmas ?? []);
        setPlanos(dadosPlanos ?? []);
        return carregarAgendaDoDia(dadosTurmas ?? []);
      })
      .then(setAgendaDoDia)
      .catch(() => setErro("Não foi possível carregar a visão geral."))
      .finally(() => setCarregando(false));
  }

  const alunosAtivos = alunos.filter((a) => a.ativo).length;
  const turmasAtivas = turmas.filter((t) => t.ativa).length;

  const planosComContagem = useMemo(
    () =>
      planos.map((plano) => ({
        ...plano,
        totalAlunos: (plano.alunos ?? []).filter((a) => a.planoAtivo).length,
      })),
    [planos]
  );

  const receitaMensalRecorrente = planosComContagem.reduce(
    (soma, p) => soma + (p.valorMensal ?? 0) * p.totalAlunos,
    0
  );

  const planoMaisPopular = planosComContagem.reduce(
    (maior, atual) =>
      !maior || atual.totalAlunos > maior.totalAlunos ? atual : maior,
    null
  );

  const turmasLotadasHoje = agendaDoDia.filter(
    (item) => item.ocupados !== null && item.ocupados >= item.turma.capacidadeMax
  );

  return (
    <div className={styles["pagina-visao-geral"]}>
      <Navbar />

      <div className={styles.conteudo}>
        <div className={styles["cabecalho-pagina"]}>
          <span className={styles["etiqueta-geral"]}>Estúdio</span>
          <h1 className={styles["titulo-pagina"]}>Visão geral</h1>
          <p className={styles["texto-data"]}>{dataDeHojeFormatada()}</p>
        </div>

        {erro && <p className={styles["mensagem-erro"]}>{erro}</p>}

        {carregando ? (
          <p className={styles["mensagem-info"]}>Carregando…</p>
        ) : (
          <>
            <div className={styles["grade-kpi"]}>
              <Link to="/alunos" className={styles["cartao-kpi-destaque"]}>
                <div className={styles["icone-kpi"]}>
                  <FiUsers size={16} />
                </div>
                <span className={styles["rotulo-kpi"]}>Alunos ativos</span>
                <span className={styles["valor-kpi"]}>{alunosAtivos}</span>
                <span className={styles["legenda-kpi"]}>de {alunos.length} cadastrados</span>
              </Link>

              <Link to="/turmas" className={styles["cartao-kpi"]}>
                <div className={styles["icone-kpi"]}>
                  <FiLayers size={16} />
                </div>
                <span className={styles["rotulo-kpi"]}>Turmas ativas</span>
                <span className={styles["valor-kpi"]}>{turmasAtivas}</span>
                <span className={styles["legenda-kpi"]}>em funcionamento</span>
              </Link>

              <Link to="/planos" className={styles["cartao-kpi"]}>
                <div className={styles["icone-kpi"]}>
                  <FiDollarSign size={16} />
                </div>
                <span className={styles["rotulo-kpi"]}>Receita recorrente</span>
                <span className={styles["valor-kpi"]}>
                  {formatarMoeda(receitaMensalRecorrente)}
                </span>
                <span className={styles["legenda-kpi"]}>por mês, planos ativos</span>
              </Link>

              <div className={styles["cartao-kpi"]}>
                <div className={styles["icone-kpi"]}>
                  <FiClock size={16} />
                </div>
                <span className={styles["rotulo-kpi"]}>Aulas hoje</span>
                <span className={styles["valor-kpi"]}>{agendaDoDia.length}</span>
                <span className={styles["legenda-kpi"]}>
                  {turmasLotadasHoje.length > 0
                    ? `${turmasLotadasHoje.length} lotada(s)`
                    : "nenhuma lotada"}
                </span>
              </div>
            </div>

            {planoMaisPopular && planoMaisPopular.totalAlunos > 0 && (
              <div className={styles["faixa-destaque"]}>
                <FiTrendingUp size={16} />
                <span>
                  Plano mais popular: <strong>{planoMaisPopular.nome}</strong> ·{" "}
                  {planoMaisPopular.totalAlunos} aluno(s)
                </span>
              </div>
            )}

            {turmasLotadasHoje.length > 0 && (
              <div className={styles["faixa-alerta"]}>
                <FiAlertTriangle size={16} />
                <span>
                  {turmasLotadasHoje.length === 1
                    ? "1 turma está lotada hoje: "
                    : `${turmasLotadasHoje.length} turmas estão lotadas hoje: `}
                  {turmasLotadasHoje
                    .map((item) => formatarHorario(item.turma.diaSemana, item.turma.horaInicio))
                    .join(", ")}
                </span>
              </div>
            )}

            <div className={styles["secao-agenda"]}>
              <div className={styles["cabecalho-secao"]}>
                <div className={styles["titulo-com-contagem"]}>
                  <FiClock size={16} />
                  <h2 className={styles["titulo-secao"]}>Agenda de hoje</h2>
                </div>
              </div>

              {agendaDoDia.length === 0 ? (
                <p className={styles["mensagem-info"]}>
                  Nenhuma aula marcada para hoje.
                </p>
              ) : (
                <div className={styles["lista-agenda"]}>
                  {agendaDoDia.map((item) => {
                    const lotada =
                      item.ocupados !== null &&
                      item.ocupados >= item.turma.capacidadeMax;

                    return (
                      <Link
                        to={`/turmas/${item.turma.id}`}
                        className={styles["item-agenda"]}
                        key={item.aula.id}
                      >
                        <span className={styles["horario-agenda"]}>
                          {(item.turma.horaInicio ?? "--:--").slice(0, 5)}
                        </span>
                        <span className={styles["info-agenda"]}>
                          <span className={styles["dia-agenda"]}>
                            {NOMES_DIA_SEMANA[item.turma.diaSemana] ?? item.turma.diaSemana}
                          </span>
                          <span className={styles["professor-agenda"]}>
                            {item.turma.professorNome ?? "Sem professor"}
                          </span>
                        </span>
                        <span
                          className={`${styles["badge-ocupacao-agenda"]} ${
                            lotada ? styles["badge-lotada"] : ""
                          }`}
                        >
                          {item.ocupados !== null ? item.ocupados : "—"}/
                          {item.turma.capacidadeMax}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

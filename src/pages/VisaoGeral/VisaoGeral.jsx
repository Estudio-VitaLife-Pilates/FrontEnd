import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./VisaoGeral.module.css";
import { Navbar } from "../../components/Navbar/Navbar";
import {
  obterAlertas,
  obterAlunosRecentes,
  obterAulasHoje,
  obterDesempenho,
  obterKpis,
  obterMetricasAlunos,
  obterMetricasAulas,
} from "../../api/dashboard";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiMinus,
  FiPieChart,
  FiRepeat,
  FiTrendingDown,
  FiTrendingUp,
  FiUserMinus,
  FiUserPlus,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

const NOMES_DIA_CURTO = {
  SEGUNDA: "Seg",
  TERCA: "Ter",
  QUARTA: "Qua",
  QUINTA: "Qui",
  SEXTA: "Sex",
  SABADO: "Sáb",
  DOMINGO: "Dom",
};

const NOMES_MES_CURTO = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const CORES_AVATAR = ["#e8d5d1", "#d4c5e2", "#f0e6e0", "#e6dff5"];
const CORES_SERIE = ["#d97960", "#d4c5e2"];

function formatarPercentual(valor) {
  return `${Math.round((valor ?? 0) * 100)}%`;
}

function formatarIniciais(nome) {
  if (!nome) return "—";
  const partes = nome.trim().split(/\s+/);
  const iniciais = partes.length > 1 ? partes[0][0] + partes[1][0] : partes[0].slice(0, 2);
  return iniciais.toUpperCase();
}

function formatarCadastroRelativo(dataIso) {
  if (!dataIso) return "—";

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(`${dataIso}T00:00:00`);
  const dias = Math.round((hoje - data) / (1000 * 60 * 60 * 24));

  if (dias <= 0) return "Cadastrado hoje";
  if (dias === 1) return "Cadastrado ontem";
  return `Cadastrado há ${dias} dias`;
}

function formatarHoraCurta(horaInicio) {
  if (!horaInicio) return "—h";
  return `${horaInicio.split(":")[0]}h`;
}

function formatarPeriodoChart(periodo, tipo) {
  if (tipo === "semanal") {
    const [, mes, dia] = periodo.split("-");
    return `${dia}/${mes}`;
  }
  const [, mes] = periodo.split("-");
  return NOMES_MES_CURTO[Number(mes) - 1] ?? periodo;
}

function proximoMultiploDeDez(valor) {
  return Math.max(10, Math.ceil(valor / 10) * 10);
}

function GraficoDesempenho({ dados, tipo }) {
  const maximo = useMemo(() => {
    const maiorValor = dados.reduce(
      (acc, item) => Math.max(acc, item.aulasRealizadas ?? 0, item.aulasCanceladas ?? 0),
      0
    );
    return proximoMultiploDeDez(maiorValor);
  }, [dados]);

  const linhasEixo = [maximo, maximo * 0.75, maximo * 0.5, maximo * 0.25, 0];

  return (
    <div className={styles["grafico-container"]}>
      <div className={styles["grafico-area"]}>
        <div className={styles["grafico-eixo-y"]}>
          {linhasEixo.map((valor) => (
            <span key={valor}>{Math.round(valor)}</span>
          ))}
        </div>

        <div className={styles["grafico-barras"]}>
          {linhasEixo.map((valor) => (
            <div key={valor} className={styles["grafico-linha-grade"]} />
          ))}

          {dados.map((item) => (
            <div className={styles["grafico-coluna"]} key={item.periodo}>
              <div className={styles["grafico-par-barras"]}>
                <div
                  className={styles["grafico-barra"]}
                  style={{
                    height: `${((item.aulasRealizadas ?? 0) / maximo) * 100}%`,
                    background: CORES_SERIE[0],
                  }}
                  title={`Realizadas: ${item.aulasRealizadas}`}
                />
                <div
                  className={styles["grafico-barra"]}
                  style={{
                    height: `${((item.aulasCanceladas ?? 0) / maximo) * 100}%`,
                    background: CORES_SERIE[1],
                  }}
                  title={`Canceladas: ${item.aulasCanceladas}`}
                />
              </div>
              <span className={styles["grafico-rotulo-x"]}>
                {formatarPeriodoChart(item.periodo, tipo)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles["grafico-legenda"]}>
        <span>
          <i style={{ background: CORES_SERIE[0] }} /> Realizadas
        </span>
        <span>
          <i style={{ background: CORES_SERIE[1] }} /> Canceladas
        </span>
      </div>
    </div>
  );
}

export default function VisaoGeral() {
  const navigate = useNavigate();

  const [kpis, setKpis] = useState(null);
  const [alertas, setAlertas] = useState(null);
  const [desempenho, setDesempenho] = useState([]);
  const [alunosRecentes, setAlunosRecentes] = useState([]);
  const [aulasHoje, setAulasHoje] = useState([]);
  const [metricasAlunos, setMetricasAlunos] = useState(null);
  const [metricasAulas, setMetricasAulas] = useState(null);

  const [periodoChart, setPeriodoChart] = useState("mensal");
  const [periodoAulas, setPeriodoAulas] = useState("hoje");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    setCarregando(true);
    setErro(null);

    Promise.all([
      obterKpis(),
      obterAlertas(),
      obterDesempenho(periodoChart),
      obterAlunosRecentes(5),
      obterAulasHoje(periodoAulas),
      obterMetricasAlunos(),
      obterMetricasAulas(),
    ])
      .then(([kpisData, alertasData, desempenhoData, alunosData, aulasData, metAlunosData, metAulasData]) => {
        setKpis(kpisData);
        setAlertas(alertasData);
        setDesempenho(desempenhoData);
        setAlunosRecentes(alunosData);
        setAulasHoje(aulasData);
        setMetricasAlunos(metAlunosData);
        setMetricasAulas(metAulasData);
      })
      .catch(() => {
        setErro("Não foi possível carregar os indicadores do painel.");
      })
      .finally(() => setCarregando(false));
  }, [periodoChart, periodoAulas]);

  const insightDesempenho = useMemo(() => {
    if (!desempenho.length) return null;

    const totalCanceladas = desempenho.reduce((acc, i) => acc + (i.aulasCanceladas ?? 0), 0);
    if (totalCanceladas === 0) return null;

    const piorPeriodo = desempenho.reduce((pior, atual) =>
      (atual.aulasCanceladas ?? 0) > (pior.aulasCanceladas ?? 0) ? atual : pior
    );
    const melhorPeriodo = desempenho.reduce((melhor, atual) =>
      (atual.aulasRealizadas ?? 0) > (melhor.aulasRealizadas ?? 0) ? atual : melhor
    );

    return `Atenção: ${formatarPeriodoChart(piorPeriodo.periodo, periodoChart)} teve o maior pico de cancelamentos (${piorPeriodo.aulasCanceladas}). ${formatarPeriodoChart(melhorPeriodo.periodo, periodoChart)} atingiu o melhor desempenho: ${melhorPeriodo.aulasRealizadas} aulas realizadas.`;
  }, [desempenho, periodoChart]);

  return (
    <div className={styles["pagina-visao-geral"]}>
      <Navbar />

      <div className={styles.conteudo}>
        <div className={styles["cabecalho-pagina"]}>
          <span className={styles["etiqueta-gestao"]}>Painel do studio</span>
          <h1 className={styles["titulo-pagina"]}>Visão Geral</h1>
        </div>

        {erro && <p className={styles["mensagem-erro"]}>{erro}</p>}

        {carregando ? (
          <p className={styles["mensagem-info"]}>Carregando painel…</p>
        ) : erro || !kpis ? null : (
          <>
            {/* KPIs */}
            <div className={styles["grade-kpi"]}>
              <div className={styles["cartao-kpi-destaque"]}>
                <div className={styles["kpi-topo"]}>
                  <div className={styles["kpi-icone"]}>
                    <FiUsers size={16} />
                  </div>
                  <span className={styles["kpi-badge-verde"]}>
                    +{kpis.novosAlunosMes} este mês
                  </span>
                </div>
                <span className={styles["rotulo-kpi"]}>Total de alunos</span>
                <span className={styles["valor-kpi"]}>{kpis.totalAlunos}</span>
                <span className={styles["legenda-kpi"]}>em planos ativos</span>
              </div>

              <div className={styles["cartao-kpi"]}>
                <div className={styles["kpi-topo"]}>
                  <div className={styles["kpi-icone"]}>
                    <FiPieChart size={16} />
                  </div>
                  {kpis.variacaoOcupacaoMes > 0 && (
                    <span className={styles["kpi-badge-verde"]}>
                      +{formatarPercentual(kpis.variacaoOcupacaoMes)} este mês
                    </span>
                  )}
                  {kpis.variacaoOcupacaoMes < 0 && (
                    <span className={styles["kpi-badge-vermelho"]}>
                      {formatarPercentual(kpis.variacaoOcupacaoMes)} este mês
                    </span>
                  )}
                  {kpis.variacaoOcupacaoMes === 0 && (
                    <span className={styles["kpi-badge-neutro"]}>
                      <FiMinus size={10} /> estável
                    </span>
                  )}
                </div>
                <span className={styles["rotulo-kpi"]}>Taxa de ocupação</span>
                <span className={styles["valor-kpi"]}>{formatarPercentual(kpis.taxaOcupacao)}</span>
                <span className={styles["legenda-kpi"]}>média das turmas</span>
              </div>

              <div className={styles["cartao-kpi"]}>
                <div className={styles["kpi-topo"]}>
                  <div className={styles["kpi-icone"]}>
                    <FiCalendar size={16} />
                  </div>
                  {kpis.aulasCanceladasSemana > 0 ? (
                    <span className={styles["kpi-badge-vermelho"]}>
                      –{kpis.aulasCanceladasSemana} canceladas
                    </span>
                  ) : (
                    <span className={styles["kpi-badge-neutro"]}>sem cancelamentos</span>
                  )}
                </div>
                <span className={styles["rotulo-kpi"]}>Aulas esta semana</span>
                <span className={styles["valor-kpi"]}>{kpis.aulasSemana}</span>
                <span className={styles["legenda-kpi"]}>de {kpis.aulasProgramadasSemana} programadas</span>
              </div>

              <div className={styles["cartao-kpi"]}>
                <div className={styles["kpi-topo"]}>
                  <div className={styles["kpi-icone"]}>
                    <FiAward size={16} />
                  </div>
                  <span className={styles["kpi-badge-neutro"]}>
                    <FiMinus size={10} /> estável
                  </span>
                </div>
                <span className={styles["rotulo-kpi"]}>Taxa de retenção</span>
                <span className={styles["valor-kpi"]}>{formatarPercentual(kpis.taxaRetencao)}</span>
                <span className={styles["legenda-kpi"]}>{formatarPercentual(kpis.taxaSaidaMes)} saída este mês</span>
              </div>
            </div>

            {/* Alertas */}
            <div className={styles["grade-alertas"]}>
              <div className={`${styles["banner-alerta"]} ${styles["banner-amarelo"]}`}>
                <div className={styles["banner-icone"]}>
                  <FiClock size={20} />
                </div>
                <div className={styles["banner-texto"]}>
                  <span className={styles["banner-valor"]}>{alertas.alunosParaReagendamento}</span>
                  <span className={styles["banner-titulo"]}>Alunos para reagendamento</span>
                  <span className={styles["banner-subtitulo"]}>Aguardando nova data de aula</span>
                </div>
                <button className={styles["banner-botao"]} onClick={() => navigate("/alunos")}>
                  Ver todos <FiArrowRight size={12} />
                </button>
              </div>

              <div className={`${styles["banner-alerta"]} ${styles["banner-vermelho"]}`}>
                <div className={styles["banner-icone"]}>
                  <FiXCircle size={20} />
                </div>
                <div className={styles["banner-texto"]}>
                  <span className={styles["banner-valor"]}>{alertas.aulasCanceladasMes}</span>
                  <span className={styles["banner-titulo"]}>Aulas canceladas no mês</span>
                  <span className={styles["banner-subtitulo"]}>
                    {alertas.aulasRemarcadasMes} foram remarcadas (
                    {alertas.aulasCanceladasMes > 0
                      ? Math.round((alertas.aulasRemarcadasMes / alertas.aulasCanceladasMes) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <button className={styles["banner-botao"]} onClick={() => navigate("/turmas")}>
                  Ver todos <FiArrowRight size={12} />
                </button>
              </div>

              <div className={`${styles["banner-alerta"]} ${styles["banner-verde"]}`}>
                <div className={styles["banner-icone"]}>
                  <FiUserPlus size={20} />
                </div>
                <div className={styles["banner-texto"]}>
                  <span className={styles["banner-valor"]}>{alertas.novosAlunosMes}</span>
                  <span className={styles["banner-titulo"]}>Novos alunos este mês</span>
                  <span className={styles["banner-subtitulo"]}>
                    {alertas.desmatriculasMes} desmatrícula(s) no período
                  </span>
                </div>
                <button className={styles["banner-botao"]} onClick={() => navigate("/alunos")}>
                  Ver todos <FiArrowRight size={12} />
                </button>
              </div>
            </div>

            {/* Gráfico de desempenho */}
            <div className={styles["cartao-grafico"]}>
              <div className={styles["cartao-grafico-cabecalho"]}>
                <div>
                  <span className={styles["rotulo-secao"]}>Desempenho operacional</span>
                  <h2 className={styles["titulo-secao"]}>Aulas realizadas vs Canceladas</h2>
                </div>

                <div className={styles["seletor-periodo"]}>
                  <button
                    className={periodoChart === "semanal" ? styles["seletor-ativo"] : ""}
                    onClick={() => setPeriodoChart("semanal")}
                  >
                    Semanal
                  </button>
                  <button
                    className={periodoChart === "mensal" ? styles["seletor-ativo"] : ""}
                    onClick={() => setPeriodoChart("mensal")}
                  >
                    Mensal
                  </button>
                </div>
              </div>

              <GraficoDesempenho dados={desempenho} tipo={periodoChart} />

              {insightDesempenho && (
                <div className={styles["aviso-insight"]}>
                  <FiAlertTriangle size={14} />
                  <p>{insightDesempenho}</p>
                </div>
              )}
            </div>

            {/* Listas: alunos recentes + aulas de hoje */}
            <div className={styles["grade-listas"]}>
              <div className={styles["cartao-lista"]}>
                <div className={styles["cartao-lista-cabecalho"]}>
                  <div>
                    <span className={styles["rotulo-secao"]}>Novos cadastros</span>
                    <h2 className={styles["titulo-secao"]}>Alunos recentes</h2>
                  </div>
                  <button className={styles["link-ver-todos"]} onClick={() => navigate("/alunos")}>
                    Ver todos <FiArrowRight size={12} />
                  </button>
                </div>

                {alunosRecentes.length === 0 ? (
                  <p className={styles["mensagem-info"]}>Nenhum aluno cadastrado recentemente.</p>
                ) : (
                  alunosRecentes.map((aluno, indice) => (
                    <div className={styles["linha-aluno-recente"]} key={aluno.id}>
                      <div
                        className={styles["avatar-recente"]}
                        style={{ background: CORES_AVATAR[indice % CORES_AVATAR.length] }}
                      >
                        {formatarIniciais(aluno.nome)}
                      </div>
                      <div className={styles["info-aluno-recente"]}>
                        <p className={styles["nome-aluno-recente"]}>{aluno.nome}</p>
                        <p className={styles["telefone-aluno-recente"]}>{aluno.telefone || "—"}</p>
                      </div>
                      <div className={styles["meta-aluno-recente"]}>
                        <span className={styles["badge-plano"]}>
                          {aluno.frequenciaSemanal ? `${aluno.frequenciaSemanal}x/sem` : "—"}
                          {aluno.nomePlano ? ` · ${aluno.nomePlano}` : ""}
                        </span>
                        <span className={styles["data-aluno-recente"]}>
                          {formatarCadastroRelativo(aluno.dataCadastro)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className={styles["cartao-agenda"]}>
                <div className={styles["cartao-lista-cabecalho"]}>
                  <div>
                    <span className={styles["rotulo-secao"]}>Programação</span>
                    <h2 className={styles["titulo-secao"]}>Aulas de hoje</h2>
                  </div>

                  <div className={styles["seletor-periodo"]}>
                    <button
                      className={periodoAulas === "hoje" ? styles["seletor-ativo"] : ""}
                      onClick={() => setPeriodoAulas("hoje")}
                    >
                      Hoje
                    </button>
                    <button
                      className={periodoAulas === "semana" ? styles["seletor-ativo"] : ""}
                      onClick={() => setPeriodoAulas("semana")}
                    >
                      Semana
                    </button>
                  </div>
                </div>

                {aulasHoje.length === 0 ? (
                  <p className={styles["mensagem-info"]}>Nenhuma aula programada.</p>
                ) : (
                  aulasHoje.map((aula, indice) => (
                    <div className={styles["linha-agenda"]} key={aula.id}>
                      <span className={styles["hora-agenda"]}>{formatarHoraCurta(aula.horaInicio)}</span>
                      <span
                        className={styles["ponto-agenda"]}
                        style={{ background: CORES_SERIE[indice % CORES_SERIE.length] }}
                      />
                      <div className={styles["info-agenda"]}>
                        <p className={styles["professor-agenda"]}>{aula.professorNome || "—"}</p>
                        <p className={styles["detalhe-agenda"]}>
                          {NOMES_DIA_CURTO[aula.turmaDiaSemana] ?? aula.turmaDiaSemana}, {formatarHoraCurta(aula.horaInicio)} · {aula.totalAlunos} alunos
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Métricas detalhadas */}
            <div className={styles["grade-metricas"]}>
              <div className={styles["cartao-metricas"]}>
                <div className={styles["cartao-metricas-cabecalho"]}>
                  <FiUsers size={16} />
                  <h2 className={styles["titulo-secao"]}>Métricas de alunos</h2>
                  <span className={styles["etiqueta-mes"]}>este mês</span>
                </div>

                <div className={styles["grade-metricas-itens"]}>
                  <div className={styles["item-metrica"]}>
                    <span className={styles["item-metrica-rotulo"]}>
                      <FiUserPlus size={14} /> Novos alunos
                    </span>
                    <span className={styles["item-metrica-valor"]}>{metricasAlunos.novosAlunos}</span>
                    <span className={styles["item-metrica-legenda"]}>
                      {metricasAlunos.variacaoNovosAlunos >= 0 ? "+" : ""}
                      {metricasAlunos.variacaoNovosAlunos} vs mês anterior
                    </span>
                  </div>

                  <div className={styles["item-metrica"]}>
                    <span className={styles["item-metrica-rotulo"]}>
                      <FiUserMinus size={14} /> Desmatriculados
                    </span>
                    <span className={styles["item-metrica-valor"]}>{metricasAlunos.desmatriculados}</span>
                    <span className={styles["item-metrica-legenda"]}>
                      {metricasAlunos.variacaoDesmatriculados >= 0 ? "+" : ""}
                      {metricasAlunos.variacaoDesmatriculados} vs mês anterior
                    </span>
                  </div>

                  <div className={styles["item-metrica"]}>
                    <span className={styles["item-metrica-rotulo"]}>
                      <FiClock size={14} /> Para reagendamento
                    </span>
                    <span className={styles["item-metrica-valor"]}>{metricasAlunos.paraReagendamento}</span>
                    {metricasAlunos.paraReagendamento > 0 && (
                      <span className={styles["item-metrica-legenda-alerta"]}>Ação necessária</span>
                    )}
                  </div>

                  <div className={styles["item-metrica"]}>
                    <span className={styles["item-metrica-rotulo"]}>
                      <FiTrendingDown size={14} /> Taxa de saída
                    </span>
                    <span className={styles["item-metrica-valor"]}>{formatarPercentual(metricasAlunos.taxaSaida)}</span>
                    <span className={styles["item-metrica-legenda"]}>Meta: abaixo de 8%</span>
                  </div>
                </div>
              </div>

              <div className={styles["cartao-metricas"]}>
                <div className={styles["cartao-metricas-cabecalho"]}>
                  <FiCheckCircle size={16} />
                  <h2 className={styles["titulo-secao"]}>Métricas de aulas</h2>
                  <span className={styles["etiqueta-mes"]}>este mês</span>
                </div>

                <div className={styles["grade-metricas-itens"]}>
                  <div className={styles["item-metrica"]}>
                    <span className={styles["item-metrica-rotulo"]}>
                      <FiXCircle size={14} /> Aulas canceladas
                    </span>
                    <span className={styles["item-metrica-valor"]}>{metricasAulas.aulasCanceladas}</span>
                    {metricasAulas.aulasCanceladas > 0 && (
                      <span className={styles["item-metrica-legenda-alerta"]}>Acima da média</span>
                    )}
                  </div>

                  <div className={styles["item-metrica"]}>
                    <span className={styles["item-metrica-rotulo"]}>
                      <FiRepeat size={14} /> Aulas remarcadas
                    </span>
                    <span className={styles["item-metrica-valor"]}>{metricasAulas.aulasRemarcadas}</span>
                  </div>

                  <div className={styles["item-metrica"]}>
                    <span className={styles["item-metrica-rotulo"]}>
                      <FiTrendingUp size={14} /> Taxa de remarcação
                    </span>
                    <span className={styles["item-metrica-valor"]}>{formatarPercentual(metricasAulas.taxaRemarcacao)}</span>
                    <span className={styles["item-metrica-legenda"]}>Meta: acima de 60%</span>
                  </div>

                  <div className={styles["item-metrica"]}>
                    <span className={styles["item-metrica-rotulo"]}>
                      <FiCheckCircle size={14} /> Aulas realizadas
                    </span>
                    <span className={styles["item-metrica-valor"]}>{metricasAulas.aulasRealizadas}</span>
                    <span className={styles["item-metrica-legenda"]}>de {metricasAulas.aulasProgramadas} programadas</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

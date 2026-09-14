import { useEffect, useMemo, useState } from "react";
import styles from "./Planos.module.css";
import { Navbar } from "../../components/Navbar/Navbar";
import {
  cadastrarPlano,
  editarPlano,
  listarPlanosDetalhado,
  removerPlano,
} from "../../api/planos";
import { FiUsers, FiTrendingUp, FiBarChart2, FiLayers, FiEdit2, FiTrash2 } from "react-icons/fi";
import iconeMais from "../../assets/icone-mais.svg";

function rotuloGrupo(validadeDias) {
  if (validadeDias <= 31) return "mensais";
  if (validadeDias <= 95) return "trimestrais";
  if (validadeDias <= 190) return "semestrais";
  if (validadeDias <= 370) return "anuais";
  return `a cada ${validadeDias} dias`;
}

function formatarMoeda(valor) {
  return (valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const FORM_VAZIO = {
  nome: "",
  frequenciaSemanal: "",
  validadeDias: "",
  valorMensal: "",
};

export default function Planos() {
  const [planos, setPlanos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [planoEmEdicao, setPlanoEmEdicao] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarPlanos();
  }, []);

  function carregarPlanos() {
    setCarregando(true);
    setErro(null);
    listarPlanosDetalhado()
      .then((dados) => setPlanos(dados ?? []))
      .catch(() => setErro("Não foi possível carregar os planos."))
      .finally(() => setCarregando(false));
  }

  const planosComContagem = useMemo(
    () =>
      planos.map((plano) => ({
        ...plano,
        totalAlunos: (plano.alunos ?? []).filter((a) => a.planoAtivo).length,
      })),
    [planos]
  );

  const maxAlunos = Math.max(1, ...planosComContagem.map((p) => p.totalAlunos));

  const totalAlunosGeral = planosComContagem.reduce(
    (soma, p) => soma + p.totalAlunos,
    0
  );

  const planoMaisPopular = planosComContagem.reduce(
    (maior, atual) =>
      !maior || atual.totalAlunos > maior.totalAlunos ? atual : maior,
    null
  );

  const mediaPorPlano =
    planosComContagem.length > 0
      ? Math.round(totalAlunosGeral / planosComContagem.length)
      : 0;

  const grupos = useMemo(() => {
    const mapa = new Map();
    for (const plano of planosComContagem) {
      const chave = plano.validadeDias;
      if (!mapa.has(chave)) mapa.set(chave, []);
      mapa.get(chave).push(plano);
    }
    return [...mapa.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([validadeDias, itens]) => ({
        titulo: `Planos ${rotuloGrupo(validadeDias)}`,
        itens,
        totalAlunos: itens.reduce((soma, p) => soma + p.totalAlunos, 0),
      }));
  }, [planosComContagem]);

  function abrirCadastro() {
    setPlanoEmEdicao(null);
    setForm(FORM_VAZIO);
    setModalAberto(true);
  }

  function abrirEdicao(plano) {
    setPlanoEmEdicao(plano);
    setForm({
      nome: plano.nome,
      frequenciaSemanal: plano.frequenciaSemanal,
      validadeDias: plano.validadeDias,
      valorMensal: plano.valorMensal,
    });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setPlanoEmEdicao(null);
    setForm(FORM_VAZIO);
  }

  function setValorCampo(campo) {
    return (event) => setForm((atual) => ({ ...atual, [campo]: event.target.value }));
  }

  function executarSalvar(event) {
    event.preventDefault();
    setEnviando(true);

    const corpo = {
      nome: form.nome,
      frequenciaSemanal: Number(form.frequenciaSemanal),
      validadeDias: Number(form.validadeDias),
      valorMensal: Number(form.valorMensal),
    };

    const promessa = planoEmEdicao
      ? editarPlano(planoEmEdicao.id, corpo)
      : cadastrarPlano(corpo);

    promessa
      .then(() => {
        fecharModal();
        carregarPlanos();
      })
      .catch(() => setErro("Não foi possível salvar o plano."))
      .finally(() => setEnviando(false));
  }

  function executarRemocao(plano) {
    if (
      !window.confirm(
        `Excluir o plano "${plano.nome}"? Essa ação não pode ser desfeita.`
      )
    )
      return;

    removerPlano(plano.id)
      .then(carregarPlanos)
      .catch(() => setErro("Não foi possível excluir o plano."));
  }

  return (
    <div className={styles["pagina-planos"]}>
      <Navbar />

      <div className={styles.conteudo}>
        <div className={styles["cabecalho-pagina"]}>
          <div>
            <span className={styles["etiqueta-comercial"]}>Comercial</span>
            <h1 className={styles["titulo-pagina"]}>Planos</h1>
          </div>
          <button className={styles["botao-cadastrar"]} onClick={abrirCadastro}>
            <img src={iconeMais} alt="" className={styles["icone-botao"]} />
            Cadastrar plano
          </button>
        </div>

        {erro && <p className={styles["mensagem-erro"]}>{erro}</p>}

        {carregando ? (
          <p className={styles["mensagem-info"]}>Carregando planos…</p>
        ) : planosComContagem.length === 0 ? (
          <p className={styles["mensagem-info"]}>Nenhum plano cadastrado.</p>
        ) : (
          <>
            <div className={styles["grade-kpi"]}>
              <div className={styles["cartao-kpi-destaque"]}>
                <div className={styles["icone-kpi"]}>
                  <FiUsers size={16} />
                </div>
                <span className={styles["rotulo-kpi"]}>Total de alunos</span>
                <span className={styles["valor-kpi"]}>{totalAlunosGeral}</span>
                <span className={styles["legenda-kpi"]}>em planos ativos</span>
              </div>

              <div className={styles["cartao-kpi"]}>
                <div className={styles["icone-kpi"]}>
                  <FiTrendingUp size={16} />
                </div>
                <span className={styles["rotulo-kpi"]}>Plano mais popular</span>
                <span className={styles["valor-kpi"]}>
                  {planoMaisPopular ? planoMaisPopular.nome : "—"}
                </span>
                <span className={styles["legenda-kpi"]}>
                  {planoMaisPopular ? `${planoMaisPopular.totalAlunos} alunos` : "sem dados"}
                </span>
              </div>

              <div className={styles["cartao-kpi"]}>
                <div className={styles["icone-kpi"]}>
                  <FiBarChart2 size={16} />
                </div>
                <span className={styles["rotulo-kpi"]}>Média por plano</span>
                <span className={styles["valor-kpi"]}>{mediaPorPlano}</span>
                <span className={styles["legenda-kpi"]}>alunos por plano</span>
              </div>

              <div className={styles["cartao-kpi"]}>
                <div className={styles["icone-kpi"]}>
                  <FiLayers size={16} />
                </div>
                <span className={styles["rotulo-kpi"]}>Total de planos</span>
                <span className={styles["valor-kpi"]}>{planosComContagem.length}</span>
                <span className={styles["legenda-kpi"]}>cadastrados no studio</span>
              </div>
            </div>

            {grupos.map((grupo) => (
              <div className={styles["grupo-planos"]} key={grupo.titulo}>
                <div className={styles["cabecalho-grupo"]}>
                  <h2 className={styles["titulo-grupo"]}>{grupo.titulo}</h2>
                  <span className={styles["contagem-grupo"]}>
                    {grupo.itens.length} planos · {grupo.totalAlunos} alunos
                  </span>
                </div>

                <div className={styles["tabela-planos"]}>
                  <div className={styles["linha-cabecalho"]}>
                    <span>Plano</span>
                    <span className={styles["coluna-central"]}>Alunos</span>
                    <span className={styles["coluna-central"]}>Distribuição</span>
                    <span className={styles["coluna-valor"]}>Valor</span>
                    <span className={styles["coluna-acoes"]}>Ações</span>
                  </div>

                  {grupo.itens.map((plano) => (
                    <div className={styles["linha-plano"]} key={plano.id}>
                      <span className={styles["celula-nome-plano"]}>
                        <span className={styles["nome-plano"]}>{plano.nome}</span>
                        <span className={styles["frequencia-plano"]}>
                          {plano.frequenciaSemanal}x por semana
                        </span>
                      </span>

                      <span className={styles["alunos-plano"]}>
                        <FiUsers size={14} />
                        {plano.totalAlunos}
                      </span>

                      <div className={styles["barra-distribuicao"]}>
                        <div
                          className={styles["barra-preenchida"]}
                          style={{
                            width: `${(plano.totalAlunos / maxAlunos) * 100}%`,
                          }}
                        />
                      </div>

                      <span className={styles["valor-plano"]}>
                        {formatarMoeda(plano.valorMensal)}
                        <small>/mês</small>
                      </span>

                      <div className={styles["acoes-plano"]}>
                        <button
                          className={styles["botao-icone"]}
                          onClick={() => abrirEdicao(plano)}
                          aria-label={`Editar plano ${plano.nome}`}
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          className={`${styles["botao-icone"]} ${styles["botao-icone-perigo"]}`}
                          onClick={() => executarRemocao(plano)}
                          aria-label={`Excluir plano ${plano.nome}`}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {modalAberto && (
        <div className={styles["fundo-modal"]} onClick={fecharModal}>
          <div className={styles["caixa-modal"]} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles["titulo-modal"]}>
              {planoEmEdicao ? "Editar plano" : "Cadastrar plano"}
            </h2>

            <form onSubmit={executarSalvar}>
              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="nome">
                  Nome do plano
                </label>
                <input
                  id="nome"
                  className={styles["input-modal"]}
                  placeholder="Ex: Mensal 2x/semana"
                  value={form.nome}
                  onChange={setValorCampo("nome")}
                  required
                />
              </div>

              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="frequenciaSemanal">
                  Frequência semanal
                </label>
                <input
                  id="frequenciaSemanal"
                  type="number"
                  min="1"
                  className={styles["input-modal"]}
                  placeholder="Ex: 2"
                  value={form.frequenciaSemanal}
                  onChange={setValorCampo("frequenciaSemanal")}
                  required
                />
              </div>

              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="validadeDias">
                  Validade (dias)
                </label>
                <input
                  id="validadeDias"
                  type="number"
                  min="1"
                  className={styles["input-modal"]}
                  placeholder="Ex: 30"
                  value={form.validadeDias}
                  onChange={setValorCampo("validadeDias")}
                  required
                />
              </div>

              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="valorMensal">
                  Valor mensal (R$)
                </label>
                <input
                  id="valorMensal"
                  type="number"
                  min="0"
                  step="0.01"
                  className={styles["input-modal"]}
                  placeholder="Ex: 160.00"
                  value={form.valorMensal}
                  onChange={setValorCampo("valorMensal")}
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
                <button type="submit" className={styles["botao-salvar"]} disabled={enviando}>
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

import { useEffect, useMemo, useState } from "react";
import styles from "./Alunos.module.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { cadastrarAluno, listarAlunosDetalhado } from "../../api/alunos";
import { listarAlunosDaTurma, listarTurmas } from "../../api/turmas";
import { FiPlus, FiSearch, FiPhone, FiChevronRight } from "react-icons/fi";

const NOMES_DIA_CURTO = {
  SEGUNDA: "Seg",
  TERCA: "Ter",
  QUARTA: "Qua",
  QUINTA: "Qui",
  SEXTA: "Sex",
  SABADO: "Sáb",
  DOMINGO: "Dom",
};

function formatarHorarioCurto(diaSemana, horaInicio) {
  const dia = NOMES_DIA_CURTO[diaSemana] ?? diaSemana;
  const [hora] = (horaInicio ?? "00:00").split(":");
  return `${dia}, ${hora}h`;
}

function formatarData(data) {
  if (!data) return "—";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}`;
}

const FORM_VAZIO = {
  nome: "",
  telefone: "",
  cpf: "",
  email: "",
  dataNascimento: "",
  fichaAnamnese: "",
};

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [turmasPorAluno, setTurmasPorAluno] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarTudo();
  }, []);

  function carregarTudo() {
    setCarregando(true);
    setErro(null);

    Promise.all([listarAlunosDetalhado(), listarTurmas()])
      .then(([dadosAlunos, dadosTurmas]) =>
        Promise.all(
          dadosTurmas.map((turma) =>
            listarAlunosDaTurma(turma.id).then((detalhe) => ({
              turma,
              alunos: detalhe.alunos ?? [],
            }))
          )
        ).then((porTurma) => {
          const mapa = {};
          for (const { turma, alunos: alunosDaTurma } of porTurma) {
            const rotulo = formatarHorarioCurto(turma.diaSemana, turma.horaInicio);
            for (const aluno of alunosDaTurma) {
              if (!mapa[aluno.id]) mapa[aluno.id] = [];
              mapa[aluno.id].push(rotulo);
            }
          }
          setTurmasPorAluno(mapa);
          setAlunos(dadosAlunos ?? []);
        })
      )
      .catch(() => setErro("Não foi possível carregar os alunos."))
      .finally(() => setCarregando(false));
  }

  const alunosFiltrados = useMemo(() => {
    const buscaMinuscula = busca.toLowerCase();
    return alunos.filter((aluno) => {
      const bateBusca =
        !busca ||
        aluno.nome.toLowerCase().includes(buscaMinuscula) ||
        (aluno.telefone ?? "").includes(busca);
      const bateStatus =
        !filtroStatus ||
        (filtroStatus === "ATIVO" && aluno.ativo) ||
        (filtroStatus === "INATIVO" && !aluno.ativo);
      return bateBusca && bateStatus;
    });
  }, [alunos, busca, filtroStatus]);

  const totalAlunos = alunos.length;
  const totalAtivos = alunos.filter((a) => a.ativo).length;
  const totalInativos = totalAlunos - totalAtivos;

  function abrirModal() {
    setForm(FORM_VAZIO);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  function setValorCampo(campo) {
    return (event) =>
      setForm((atual) => ({ ...atual, [campo]: event.target.value }));
  }

  function executarCadastro(event) {
    event.preventDefault();
    setEnviando(true);

    cadastrarAluno({
      nome: form.nome,
      telefone: form.telefone || null,
      cpf: form.cpf || null,
      email: form.email || null,
      dataNascimento: form.dataNascimento || null,
      fichaAnamnese: form.fichaAnamnese || null,
    })
      .then(() => {
        fecharModal();
        carregarTudo();
      })
      .catch(() => setErro("Não foi possível cadastrar o aluno."))
      .finally(() => setEnviando(false));
  }

  return (
    <div className={styles["pagina-alunos"]}>
      <Navbar />

      <div className={styles.conteudo}>
        <div className={styles["cabecalho-pagina"]}>
          <div>
            <span className={styles["etiqueta-gestao"]}>Gestão</span>
            <h1 className={styles["titulo-pagina"]}>Alunos</h1>
          </div>
          <button className={styles["botao-cadastrar"]} onClick={abrirModal}>
            <FiPlus size={16} />
            Cadastrar
          </button>
        </div>

        {erro && <p className={styles["mensagem-erro"]}>{erro}</p>}

        {carregando ? (
          <p className={styles["mensagem-info"]}>Carregando alunos…</p>
        ) : (
          <>
            <div className={styles["grade-kpi"]}>
              <div className={styles["cartao-kpi-destaque"]}>
                <span className={styles["rotulo-kpi"]}>Total de alunos</span>
                <span className={styles["valor-kpi"]}>{totalAlunos}</span>
                <span className={styles["legenda-kpi"]}>cadastrados no sistema</span>
              </div>
              <div className={styles["cartao-kpi"]}>
                <span className={styles["rotulo-kpi"]}>Alunos ativos</span>
                <span className={styles["valor-kpi"]}>{totalAtivos}</span>
                <span className={styles["legenda-kpi"]}>ativos no sistema</span>
              </div>
              <div className={styles["cartao-kpi"]}>
                <span className={styles["rotulo-kpi"]}>Alunos inativos</span>
                <span className={styles["valor-kpi"]}>{totalInativos}</span>
                <span className={styles["legenda-kpi"]}>inativos no sistema</span>
              </div>
            </div>

            <div className={styles["barra-filtros"]}>
              <div className={styles["grupo-campo-filtro"]}>
                <label className={styles["rotulo-busca"]} htmlFor="busca">
                  Busca por nome ou telefone
                </label>
                <div className={styles["container-busca"]}>
                  <FiSearch size={16} className={styles["icone-busca"]} />
                  <input
                    id="busca"
                    className={styles["input-busca"]}
                    placeholder="Ex: Bruno ou (11) 9..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles["grupo-campo-filtro-status"]}>
                <label className={styles["rotulo-busca"]} htmlFor="filtroStatus">
                  Status
                </label>
                <select
                  id="filtroStatus"
                  className={styles["select-filtro"]}
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                </select>
              </div>
            </div>

            {alunosFiltrados.length === 0 ? (
              <p className={styles["mensagem-info"]}>Nenhum aluno encontrado.</p>
            ) : (
              <div className={styles["tabela-alunos"]}>
                <div className={styles["linha-cabecalho"]}>
                  <span>Nome / Telefone</span>
                  <span>Vencimento</span>
                  <span>Turma</span>
                  <span className={styles["coluna-status"]}>Status</span>
                </div>

                {alunosFiltrados.map((aluno) => {
                  const planoAtivo = (aluno.planos ?? []).find((p) => p.ativo);
                  const turmasDoAluno = turmasPorAluno[aluno.id] ?? [];

                  return (
                    <div className={styles["linha-aluno"]} key={aluno.id}>
                      <div className={styles["nome-com-avatar"]}>
                        <div className={styles["avatar-aluno"]}>
                          {aluno.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={styles["nome-aluno"]}>{aluno.nome}</p>
                          <p className={styles["telefone-aluno"]}>
                            <FiPhone size={12} />
                            {aluno.telefone || "—"}
                          </p>
                        </div>
                      </div>

                      <span className={styles["vencimento-aluno"]}>
                        {planoAtivo ? formatarData(planoAtivo.dataFim) : "—"}
                      </span>

                      <span className={styles["turma-aluno"]}>
                        {turmasDoAluno.length > 0 ? turmasDoAluno.join(" / ") : "—"}
                      </span>

                      <div className={styles["coluna-status"]}>
                        <span
                          className={`${styles.badge} ${
                            aluno.ativo ? styles.badgeAtivo : styles.badgeInativo
                          }`}
                        >
                          {aluno.ativo ? "Ativo" : "Inativo"}
                        </span>
                        <FiChevronRight size={16} className={styles["icone-seta"]} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {modalAberto && (
        <div className={styles["fundo-modal"]} onClick={fecharModal}>
          <div className={styles["caixa-modal"]} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles["titulo-modal"]}>Cadastrar aluno</h2>

            <form onSubmit={executarCadastro}>
              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="nome">
                  Nome completo
                </label>
                <input
                  id="nome"
                  className={styles["input-modal"]}
                  value={form.nome}
                  onChange={setValorCampo("nome")}
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
                  value={form.telefone}
                  onChange={setValorCampo("telefone")}
                />
              </div>

              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="cpf">
                  CPF
                </label>
                <input
                  id="cpf"
                  className={styles["input-modal"]}
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={setValorCampo("cpf")}
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
                  value={form.email}
                  onChange={setValorCampo("email")}
                />
              </div>

              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="dataNascimento">
                  Data de nascimento
                </label>
                <input
                  id="dataNascimento"
                  type="date"
                  className={styles["input-modal"]}
                  value={form.dataNascimento}
                  onChange={setValorCampo("dataNascimento")}
                />
              </div>

              <div className={styles["grupo-campo"]}>
                <label className={styles["rotulo-campo"]} htmlFor="fichaAnamnese">
                  Ficha de anamnese
                </label>
                <textarea
                  id="fichaAnamnese"
                  className={styles["textarea-modal"]}
                  rows={3}
                  value={form.fichaAnamnese}
                  onChange={setValorCampo("fichaAnamnese")}
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

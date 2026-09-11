import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./DadosAluno.module.css";
import { Navbar } from "../../components/Navbar/Navbar";
import {
  associarPlano,
  buscarAlunoDetalhadoPorId,
  editarAluno,
  inativarAluno,
} from "../../api/alunos";
import { listarAlunosDaTurma, listarTurmas } from "../../api/turmas";
import { listarPlanos } from "../../api/planos";
import {
  cancelarAulaDoAluno,
  listarAulasDoAluno,
  registrarReposicao,
  buscarProximaAulaInfoDaTurma,
} from "../../api/aulas";
import {
  FiArrowLeft,
  FiPhone,
  FiMail,
  FiCreditCard,
  FiUserX,
  FiEdit2,
  FiX,
  FiRepeat,
  FiPlus,
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
};

function formatarHorario(diaSemana, horaInicio) {
  const dia = NOMES_DIA_SEMANA[diaSemana] ?? diaSemana ?? "—";
  const [hora, minuto] = (horaInicio ?? "00:00").split(":");
  const sufixo = minuto && minuto !== "00" ? `${hora}h${minuto}` : `${hora}h`;
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
  const [aulas, setAulas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [acaoErro, setAcaoErro] = useState(null);

  const [modalFichaAberto, setModalFichaAberto] = useState(false);
  const [ficha, setFicha] = useState("");
  const [salvandoFicha, setSalvandoFicha] = useState(false);
  const [erroFicha, setErroFicha] = useState(null);

  const [modalRemarcarAberto, setModalRemarcarAberto] = useState(false);
  const [aulaParaRemarcar, setAulaParaRemarcar] = useState(null);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState([]);
  const [turmaDestinoSelecionada, setTurmaDestinoSelecionada] = useState("");
  const [remarcando, setRemarcando] = useState(false);
  const [erroRemarcar, setErroRemarcar] = useState(null);

  const [modalPlanoAberto, setModalPlanoAberto] = useState(false);
  const [planosDisponiveis, setPlanosDisponiveis] = useState([]);
  const [planoSelecionado, setPlanoSelecionado] = useState("");
  const [vinculandoPlano, setVinculandoPlano] = useState(false);
  const [erroPlano, setErroPlano] = useState(null);

  useEffect(() => {
    carregarTudo();
  }, [id]);

  function carregarTudo() {
    setCarregando(true);
    setErro(null);

    Promise.all([
      buscarAlunoDetalhadoPorId(id),
      listarAulasDoAluno(id),
      listarTurmas(),
    ])
      .then(([dadosAluno, dadosAulas, dadosTurmas]) => {
        setAluno(dadosAluno);
        setFicha(dadosAluno.fichaAnamnese ?? "");
        setAulas(dadosAulas ?? []);

        return Promise.all(
          (dadosTurmas ?? []).map((turma) =>
            listarAlunosDaTurma(turma.id).then((detalhe) => ({
              turma,
              temAluno: (detalhe.alunos ?? []).some(
                (a) => String(a.id) === String(id)
              ),
            }))
          )
        ).then((porTurma) => {
          const labels = porTurma
            .filter((p) => p.temAluno)
            .map((p) => formatarHorarioCurto(p.turma.diaSemana, p.turma.horaInicio));
          setTurmasDoAluno(labels);
        });
      })
      .catch(() => setErro("Não foi possível carregar os dados do aluno."))
      .finally(() => setCarregando(false));
  }

  function executarInativar() {
    if (
      !window.confirm(
        `Inativar ${aluno.nome}? O aluno deixará de aparecer como ativo no sistema.`
      )
    )
      return;

    inativarAluno(aluno.id)
      .then(() => navigate("/alunos"))
      .catch(() => setAcaoErro("Não foi possível inativar o aluno."));
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
      .catch(() => setErroFicha("Não foi possível salvar a ficha de anamnese."))
      .finally(() => setSalvandoFicha(false));
  }

  function executarCancelar(aula) {
    if (!window.confirm("Cancelar esta aula do aluno?")) return;

    setAcaoErro(null);
    cancelarAulaDoAluno(aula.id)
      .then(carregarTudo)
      .catch(() => setAcaoErro("Não foi possível cancelar a aula."));
  }

  function abrirModalRemarcar(aula) {
    setErroRemarcar(null);
    listarTurmas()
      .then((turmas) => setTurmasDisponiveis((turmas ?? []).filter((t) => t.ativa)))
      .catch(() => setErroRemarcar("Não foi possível carregar as turmas disponíveis."));
    setAulaParaRemarcar(aula);
    setTurmaDestinoSelecionada("");
    setModalRemarcarAberto(true);
  }

  function fecharModalRemarcar() {
    setModalRemarcarAberto(false);
    setAulaParaRemarcar(null);
    setErroRemarcar(null);
  }

  function abrirModalPlano() {
    setErroPlano(null);
    listarPlanos()
      .then(setPlanosDisponiveis)
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
    if (!planoSelecionado) return;

    setErroPlano(null);
    setVinculandoPlano(true);
    associarPlano(aluno.id, planoSelecionado)
      .then(() => {
        fecharModalPlano();
        carregarTudo();
      })
      .catch((erro) =>
        setErroPlano(
          erro.message || "Não foi possível vincular o plano a este aluno."
        )
      )
      .finally(() => setVinculandoPlano(false));
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
            "Essa turma não tem uma próxima aula agendada. Escolha outra turma."
          );
        }

        if (String(aulaDestinoId) === String(aulaParaRemarcar.aulaId)) {
          throw new Error(
            "Essa é a mesma aula que o aluno já tem marcada. Escolha uma turma diferente para a reposição."
          );
        }

        return registrarReposicao(
          aulaDestinoId,
          aluno.id,
          aulaParaRemarcar.aulaId
        );
      })
      .then(() => {
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

  const planoAtivo = aluno?.planos?.find((p) => p.ativo);

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

        {erro && <p className={styles["mensagem-erro"]}>{erro}</p>}

        {carregando ? (
          <p className={styles["mensagem-info"]}>Carregando…</p>
        ) : !aluno ? (
          <p className={styles["mensagem-info"]}>Aluno não encontrado.</p>
        ) : (
          <>
            {acaoErro && <p className={styles["mensagem-erro"]}>{acaoErro}</p>}

            <div className={styles["cartao-perfil"]}>
              <div className={styles["avatar-perfil"]}>
                {aluno.nome.charAt(0).toUpperCase()}
              </div>

              <div className={styles["info-perfil"]}>
                <div className={styles["linha-nome"]}>
                  <h1 className={styles["nome-perfil"]}>{aluno.nome}</h1>
                  <span
                    className={`${styles.badge} ${
                      aluno.ativo ? styles.badgeAtivo : styles.badgeInativo
                    }`}
                  >
                    {aluno.ativo ? "Ativo" : "Inativo"}
                  </span>
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

                  <div className={styles["campo-editavel"]}>
                    <div>
                      <span className={styles["rotulo-campo-perfil"]}>
                        Plano
                      </span>
                      <span className={styles["valor-campo-perfil"]}>
                        {planoAtivo
                          ? `${planoAtivo.nome} · ${planoAtivo.frequenciaSemanal}x/semana`
                          : "Sem plano ativo"}
                      </span>
                    </div>
                    <button
                      className={styles["botao-vincular-plano"]}
                      onClick={abrirModalPlano}
                      title="Vincular plano"
                    >
                      <FiPlus size={13} />
                      {planoAtivo ? "Trocar plano" : "Vincular plano"}
                    </button>
                  </div>

                  <div className={styles["campo-editavel"]}>
                    <div>
                      <span className={styles["rotulo-campo-perfil"]}>
                        Turma
                      </span>
                      <span className={styles["valor-campo-perfil"]}>
                        {turmasDoAluno.length > 0
                          ? turmasDoAluno.join(" / ")
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles["cartao-ficha"]}>
              <div className={styles["cabecalho-secao"]}>
                <h2 className={styles["titulo-secao"]}>Ficha de anamnese</h2>
                <button
                  className={styles["botao-editar-ficha"]}
                  onClick={abrirModalFicha}
                >
                  <FiEdit2 size={14} />
                  Editar
                </button>
              </div>
              <p className={styles["texto-ficha"]}>
                {aluno.fichaAnamnese || "Nenhuma informação registrada ainda."}
              </p>
            </div>

            <div className={styles["secao-aulas"]}>
              <div className={styles["cabecalho-secao"]}>
                <div>
                  <span className={styles["etiqueta-agenda"]}>Agenda</span>
                  <h2 className={styles["titulo-secao"]}>Aulas agendadas</h2>
                </div>
              </div>

              {aulas.length === 0 ? (
                <p className={styles["mensagem-info"]}>
                  Nenhuma aula agendada para este aluno ainda.
                </p>
              ) : (
                <div className={styles["tabela-aulas"]}>
                  <div className={styles["linha-cabecalho-aulas"]}>
                    <span>Turma</span>
                    <span>Status</span>
                    <span>Data</span>
                    <span className={styles["coluna-acoes"]}>Ações</span>
                  </div>

                  {aulas.map((item) => (
                    <div className={styles["linha-aula"]} key={item.id}>
                      <span className={styles["turma-aula"]}>
                        {formatarHorario(item.turmaDiaSemana, item.turmaHoraInicio)}
                      </span>

                      <span>
                        {item.reposicao ? (
                          <span className={styles["badge-reposicao"]}>
                            Reposição
                          </span>
                        ) : (
                          <span className={styles["status-normal"]}>
                            {ROTULOS_STATUS[item.status] ?? item.status}
                          </span>
                        )}
                      </span>

                      <span className={styles["data-aula"]}>
                        {formatarData(item.dataAula)}
                      </span>

                      <div className={styles["coluna-acoes"]}>
                        {item.status === "CANCELADA" ? (
                          <span className={styles["texto-desabilitado"]}>—</span>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles["cartao-perigo"]}>
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
            </div>
          </>
        )}
      </div>

      {modalFichaAberto && (
        <div className={styles["fundo-modal"]} onClick={fecharModalFicha}>
          <div
            className={styles["caixa-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles["titulo-modal"]}>Editar ficha de anamnese</h2>

            {erroFicha && <p className={styles["mensagem-erro"]}>{erroFicha}</p>}

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

      {modalRemarcarAberto && (
        <div className={styles["fundo-modal"]} onClick={fecharModalRemarcar}>
          <div
            className={styles["caixa-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles["titulo-modal"]}>Remarcar aula (reposição)</h2>
            <p className={styles["texto-explicativo-modal"]}>
              Escolha a turma em que o aluno vai fazer a aula de reposição. A
              vaga será na próxima aula dessa turma — se ainda não existir
              nenhuma aula futura marcada, ela será criada automaticamente.
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
                  {turmasDisponiveis.map((turma) => (
                    <option value={turma.id} key={turma.id}>
                      {formatarHorario(turma.diaSemana, turma.horaInicio)}
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

      {modalPlanoAberto && (
        <div className={styles["fundo-modal"]} onClick={fecharModalPlano}>
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
                <label className={styles["rotulo-campo"]} htmlFor="plano">
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
                      {plano.nome} · {plano.frequenciaSemanal}x/semana · R${" "}
                      {plano.valorMensal}
                      /mês
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
    </div>
  );
}

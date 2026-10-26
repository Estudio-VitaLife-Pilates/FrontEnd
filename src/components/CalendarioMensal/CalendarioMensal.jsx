import { useMemo, useState } from "react";
import styles from "./CalendarioMensal.module.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const NOMES_MES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const DIAS_SEMANA_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function paraChaveISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function mesDaPrimeiraAula(aulas) {
  if (!aulas.length) return new Date();
  const [ano, mes, dia] = aulas[0].dataAula.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

/**
 * Grade de mês navegável. Recebe a lista de aulas da turma (cada uma com
 * `id` e `dataAula` no formato "YYYY-MM-DD") e marca os dias em que há
 * aula. Clicar num dia marcado chama onSelecionarAula com a aula inteira.
 */
export function CalendarioMensal({
  aulas = [],
  aulaSelecionadaId = null,
  onSelecionarAula,
}) {
  const [mesReferencia, setMesReferencia] = useState(() => mesDaPrimeiraAula(aulas));

  const aulasPorData = useMemo(() => {
    const mapa = new Map();
    for (const aula of aulas) {
      mapa.set(aula.dataAula, aula);
    }
    return mapa;
  }, [aulas]);

  const hojeChave = paraChaveISO(new Date());

  const celulas = useMemo(() => {
    const ano = mesReferencia.getFullYear();
    const mes = mesReferencia.getMonth();
    const primeiroDiaDoMes = new Date(ano, mes, 1);
    const inicioGrade = new Date(primeiroDiaDoMes);
    inicioGrade.setDate(inicioGrade.getDate() - primeiroDiaDoMes.getDay());

    return Array.from({ length: 42 }, (_, indice) => {
      const data = new Date(inicioGrade);
      data.setDate(inicioGrade.getDate() + indice);
      const chave = paraChaveISO(data);
      return {
        data,
        chave,
        foraDoMes: data.getMonth() !== mes,
        aula: aulasPorData.get(chave) ?? null,
        hoje: chave === hojeChave,
      };
    });
  }, [mesReferencia, aulasPorData, hojeChave]);

  function irParaMesAnterior() {
    setMesReferencia((atual) => new Date(atual.getFullYear(), atual.getMonth() - 1, 1));
  }

  function irParaProximoMes() {
    setMesReferencia((atual) => new Date(atual.getFullYear(), atual.getMonth() + 1, 1));
  }

  return (
    <div className={styles.calendario}>
      <div className={styles["cabecalho-calendario"]}>
        <button
          type="button"
          className={styles["botao-navegacao"]}
          onClick={irParaMesAnterior}
          aria-label="Mês anterior"
        >
          <FiChevronLeft size={16} />
        </button>
        <span className={styles["titulo-mes"]}>
          {NOMES_MES[mesReferencia.getMonth()]} {mesReferencia.getFullYear()}
        </span>
        <button
          type="button"
          className={styles["botao-navegacao"]}
          onClick={irParaProximoMes}
          aria-label="Próximo mês"
        >
          <FiChevronRight size={16} />
        </button>
      </div>

      <div className={styles["grade-dias-semana"]}>
        {DIAS_SEMANA_CURTO.map((dia) => (
          <span key={dia} className={styles["dia-semana"]}>
            {dia}
          </span>
        ))}
      </div>

      <div className={styles["grade-calendario"]}>
        {celulas.map(({ data, chave, foraDoMes, aula, hoje }) => (
          <button
            type="button"
            key={chave}
            className={`${styles["celula-dia"]} ${
              foraDoMes ? styles["celula-fora-do-mes"] : ""
            } ${aula ? styles["celula-com-aula"] : ""} ${
              aula && aulaSelecionadaId === aula.id ? styles["celula-selecionada"] : ""
            } ${hoje ? styles["celula-hoje"] : ""}`}
            disabled={!aula}
            onClick={() => aula && onSelecionarAula?.(aula)}
          >
            <span className={styles["numero-dia"]}>{data.getDate()}</span>
            {aula && <span className={styles["marcador-aula"]} />}
          </button>
        ))}
      </div>

      {aulas.length === 0 && (
        <p className={styles["mensagem-vazia"]}>
          Nenhuma aula futura gerada ainda para esta turma.
        </p>
      )}
    </div>
  );
}

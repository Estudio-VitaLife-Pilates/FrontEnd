import styles from "./VisaoGeral.module.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { FiTool } from "react-icons/fi";

export default function VisaoGeral() {
  return (
    <div className={styles["pagina-visao-geral"]}>
      <Navbar />

      <div className={styles.conteudo}>
        <div className={styles["cartao-construcao"]}>
          <div className={styles["icone-construcao"]}>
            <FiTool size={28} />
          </div>
          <span className={styles["etiqueta-construcao"]}>Visão geral</span>
          <h1 className={styles["titulo-construcao"]}>
            O dashboard está em construção
          </h1>
          <p className={styles["texto-construcao"]}>
            Em breve, esta página vai reunir os principais indicadores do
            estúdio (alunos, turmas, aulas do dia e planos) em um só lugar.
            Enquanto isso, use o menu acima para acessar Planos, Alunos,
            Turmas e Professores.
          </p>
        </div>
      </div>
    </div>
  );
}

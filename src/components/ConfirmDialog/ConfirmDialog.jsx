import styles from "./ConfirmDialog.module.css";

export function ConfirmDialog({
  titulo = "Confirmar ação",
  mensagem,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  perigo = false,
  onConfirmar,
  onCancelar,
}) {
  return (
    <div className={styles["fundo-modal"]} onClick={onCancelar}>
      <div className={styles["caixa-modal"]} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles["titulo-modal"]}>{titulo}</h2>
        {mensagem && <p className={styles["texto-modal"]}>{mensagem}</p>}

        <div className={styles["acoes-modal"]}>
          <button
            type="button"
            className={styles["botao-cancelar"]}
            onClick={onCancelar}
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            className={`${styles["botao-confirmar"]} ${
              perigo ? styles["botao-perigo"] : ""
            }`}
            onClick={onConfirmar}
            autoFocus
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useCallback, useRef, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog/ConfirmDialog";

/**
 * Substitui window.confirm por um modal no estilo do app.
 * Uso: const [confirmar, dialogoConfirmacao] = useConfirmacao();
 * if (!(await confirmar("Remover isso?"))) return;
 * ...renderizar {dialogoConfirmacao} uma vez na árvore do componente.
 */
export function useConfirmacao() {
  const [opcoes, setOpcoes] = useState(null);
  const resolverRef = useRef(null);

  const confirmar = useCallback((config) => {
    const normalizado = typeof config === "string" ? { mensagem: config } : config;

    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setOpcoes(normalizado);
    });
  }, []);

  function responder(resposta) {
    setOpcoes(null);
    const resolver = resolverRef.current;
    resolverRef.current = null;
    resolver?.(resposta);
  }

  const dialogoConfirmacao = opcoes ? (
    <ConfirmDialog
      titulo={opcoes.titulo}
      mensagem={opcoes.mensagem}
      textoConfirmar={opcoes.textoConfirmar}
      textoCancelar={opcoes.textoCancelar}
      perigo={opcoes.perigo}
      onConfirmar={() => responder(true)}
      onCancelar={() => responder(false)}
    />
  ) : null;

  return [confirmar, dialogoConfirmacao];
}

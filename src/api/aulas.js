import { api } from "./api";

export function buscarAlunosProximaAulaDaTurma(turmaId) {
  return api.get(`/aulas/turma/${turmaId}/proxima`);
}

export function removerAlunoDaAula(aulaAlunoId) {
  return api.remover(`/aulas/alunos/${aulaAlunoId}`);
}

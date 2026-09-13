import { api } from "./api";

export function buscarAlunosProximaAulaDaTurma(turmaId) {
  return api.get(`/aulas/turma/${turmaId}/proxima`);
}

export function removerAlunoDaAula(aulaAlunoId) {
  return api.remover(`/aulas/alunos/${aulaAlunoId}`);
}

export function listarAulasDoAluno(alunoId) {
  return api.get(`/aulas/aluno/${alunoId}`);
}

export function cancelarAulaDoAluno(aulaAlunoId) {
  return api.put(`/aulas/alunos/${aulaAlunoId}/cancelar`);
}

export function registrarReposicao(aulaDestinoId, alunoId, aulaOrigemId) {
  return api.post(`/aulas/${aulaDestinoId}/reposicao`, { alunoId, aulaOrigemId });
}

export function buscarProximaAulaInfoDaTurma(turmaId) {
  return api.get(`/aulas/turma/${turmaId}/proxima/info`);
}

export function buscarProximasAulasDaTurma(turmaId) {
  return api.get(`/aulas/turma/${turmaId}/proximas`);
}

export function listarAlunosDaAula(aulaId) {
  return api.get(`/aulas/${aulaId}/alunos`);
}

export function buscarVagasDaAula(aulaId) {
  return api.get(`/aulas/${aulaId}/vagas`);
}

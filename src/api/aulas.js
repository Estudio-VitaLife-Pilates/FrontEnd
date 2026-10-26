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

export function marcarFaltaDoAluno(aulaAlunoId) {
  return api.put(`/aulas/alunos/${aulaAlunoId}/ausente`);
}

export function listarAlunosAguardandoReagendamento() {
  return api.get(`/aulas/alunos/aguardando-reagendamento`);
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

export function buscarAulasAnterioresDaTurma(turmaId) {
  return api.get(`/aulas/turma/${turmaId}/anteriores`);
}

export function listarAlunosDaAula(aulaId) {
  return api.get(`/aulas/${aulaId}/alunos`);
}

export function buscarVagasDaAula(aulaId) {
  return api.get(`/aulas/${aulaId}/vagas`);
}

export function listarAulasDoAlunoPaginadas(alunoId, pagina = 0, tamanho = 10) {
  return api.get(`/aulas/aluno/${alunoId}`, {
    params: {
      page: pagina,
      size: tamanho,
    },
  });
}
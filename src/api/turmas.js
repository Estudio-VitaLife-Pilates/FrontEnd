import { api } from "./api";

export function listarTurmas() {
  return api.get("/turmas");
}

export function buscarTurmaPorId(id) {
  return api.get(`/turmas/${id}`);
}

export function listarTurmasPorProfessor(professorId) {
  return api.get(`/turmas/professor/${professorId}`);
}

export function buscarVagasTurma(id) {
  return api.get(`/turmas/${id}/vagas`);
}

export function editarTurma(id, turma) {
  return api.put(`/turmas/${id}`, turma);
}

export function cadastrarTurma(turma) {
  return api.post("/turmas", turma);
}

export function desativarTurma(id) {
  return api.remover(`/turmas/${id}`);
}

export function trocarProfessorDaTurma(idTurma, idProfessor) {
  return api.put(`/turmas/${idTurma}/professor/${idProfessor}/trocar`);
}

export function adicionarAlunoNaTurma(idTurma, alunoId) {
  return api.post(`/turmas/${idTurma}/alunos`, { alunoId });
}

export function removerAlunoDaTurma(idTurma, alunoId) {
  return api.remover(`/turmas/${idTurma}/alunos/${alunoId}`);
}

export function listarAlunosDaTurma(idTurma) {
  return api.get(`/turmas/${idTurma}/alunos`);
}

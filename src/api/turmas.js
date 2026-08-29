import { api } from "./api";

export function listarTurmas() {
  return api.get("/turmas");
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

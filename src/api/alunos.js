import { api } from "./api";

export function listarAlunos() {
  return api.get("/alunos");
}

export function listarAlunosDetalhado() {
  return api.get("/alunos/details");
}

export function buscarAlunoPorId(id) {
  return api.get(`/alunos/${id}`);
}

export function buscarAlunoDetalhadoPorId(id) {
  return api.get(`/alunos/${id}/details`);
}

export function cadastrarAluno(aluno) {
  return api.post("/alunos", aluno);
}

export function editarAluno(id, aluno) {
  return api.put(`/alunos/${id}`, aluno);
}

export function inativarAluno(id) {
  return api.remover(`/alunos/${id}`);
}

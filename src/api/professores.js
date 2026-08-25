import { api } from "./api";

export function listarProfessores() {
  return api.get("/professores");
}

export function cadastrarProfessor(professor) {
  return api.post("/professores", professor);
}

export function editarProfessor(id, professor) {
  return api.put(`/professores/${id}`, professor);
}

export function removerProfessor(id) {
  return api.remover(`/professores/${id}`);
}

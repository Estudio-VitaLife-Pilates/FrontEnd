import { api } from "./api";

export function listarAlunos() {
  return api.get("/alunos");
}

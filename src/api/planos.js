import { api } from "./api";

export function listarPlanosDetalhado() {
  return api.get("/planos/details");
}

export function cadastrarPlano(plano) {
  return api.post("/planos", plano);
}

export function editarPlano(id, plano) {
  return api.put(`/planos/${id}`, plano);
}

export function removerPlano(id) {
  return api.remover(`/planos/${id}`);
}

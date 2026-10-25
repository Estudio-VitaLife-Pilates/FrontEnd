import { api } from "./api";

export function obterKpis() {
  return api.get("/dashboard/kpis");
}

export function obterAlertas() {
  return api.get("/dashboard/alertas");
}

export function obterDesempenho(periodo = "mensal") {
  return api.get("/dashboard/desempenho", { params: { periodo } });
}

export function obterAlunosRecentes(limit = 5) {
  return api.get("/dashboard/alunos-recentes", { params: { limit } });
}

export function obterAulasHoje(periodo = "hoje") {
  return api.get("/dashboard/aulas-hoje", { params: { periodo } });
}

export function obterMetricasAlunos(mes) {
  return api.get("/dashboard/metricas-alunos", { params: mes ? { mes } : {} });
}

export function obterMetricasAulas(mes) {
  return api.get("/dashboard/metricas-aulas", { params: mes ? { mes } : {} });
}

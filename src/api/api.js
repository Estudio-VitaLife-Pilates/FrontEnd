const URL_BASE = "http://localhost:8080";

async function requisitar(caminho, opcoes = {}) {
  const resposta = await fetch(`${URL_BASE}${caminho}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...opcoes.headers,
    },
    ...opcoes,
  });

  if (!resposta.ok) {
    const mensagem = await resposta.text().catch(() => "");
    throw new Error(mensagem || `Erro na requisição: ${resposta.status}`);
  }

  if (resposta.status === 204) {
    return null;
  }

  return resposta.json();
}

export const api = {
  get: (caminho) => requisitar(caminho, { method: "GET" }),
  post: (caminho, corpo) =>
    requisitar(caminho, { method: "POST", body: JSON.stringify(corpo) }),
  put: (caminho, corpo) =>
    requisitar(caminho, { method: "PUT", body: JSON.stringify(corpo) }),
  remover: (caminho) => requisitar(caminho, { method: "DELETE" }),
};

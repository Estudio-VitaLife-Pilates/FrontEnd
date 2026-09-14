import axios from "axios";

const URL_BASE = "http://localhost:8080";

const cliente = axios.create({
  baseURL: URL_BASE,
  withCredentials: true, // envia o cookie httpOnly de autenticação em toda requisição
  headers: {
    "Content-Type": "application/json",
  },
});

async function requisitar(promessa) {
  try {
    const resposta = await promessa;
    return resposta.data;
  } catch (erro) {
    const dados = erro.response?.data;
    // Só usa o corpo do erro se for texto de verdade — a API às vezes responde
    // com um objeto sem campo "message" (ex.: erro sem handler específico),
    // e isso não pode virar a string "[object Object]" na tela do usuário.
    const mensagem =
      (typeof dados?.message === "string" && dados.message) ||
      (typeof dados === "string" && dados) ||
      erro.message;

    const erroTratado = new Error(mensagem || "Erro na requisição", { cause: erro });
    erroTratado.status = erro.response?.status ?? null; // null = sem resposta (rede/servidor fora do ar)
    throw erroTratado;
  }
}

export const api = {
  get: (caminho) => requisitar(cliente.get(caminho)),
  post: (caminho, corpo) => requisitar(cliente.post(caminho, corpo)),
  put: (caminho, corpo) => requisitar(cliente.put(caminho, corpo)),
  remover: (caminho) => requisitar(cliente.delete(caminho)),
};

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
    const mensagem = erro.response?.data?.message || erro.response?.data || erro.message;
    throw new Error(mensagem || "Erro na requisição");
  }
}

export const api = {
  get: (caminho) => requisitar(cliente.get(caminho)),
  post: (caminho, corpo) => requisitar(cliente.post(caminho, corpo)),
  put: (caminho, corpo) => requisitar(cliente.put(caminho, corpo)),
  remover: (caminho) => requisitar(cliente.delete(caminho)),
};

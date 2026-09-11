import { api} from "./api";

export function cadastro(usuario){
    return api.post("/usuarios",usuario)
}
export function login(usuario){
    return api.post("/usuarios/login", usuario)
}
export function logout(){
    return api.post("/usuarios/logout")
}
export function buscarMeuPerfil(){
    return api.get("/usuarios/me")
}

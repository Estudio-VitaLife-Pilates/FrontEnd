import styles from './navbar.module.css'
import { Link, NavLink, useNavigate } from "react-router-dom";
import { RxExit } from "react-icons/rx";
import { LogoTitulo } from "../LoginCadastro/LogoTitulo";
import pfpImg from '../../assets/pfp.jpg'
import { logout } from "../../api/usuarios";

const itensMenu = [
    { rotulo: "Visão geral", caminho: "/inicio" },
    { rotulo: "Planos", caminho: "/planos" },
    { rotulo: "Alunos", caminho: "/alunos" },
    { rotulo: "Turmas", caminho: "/turmas" },
    { rotulo: "Professores", caminho: "/professores" },
];

export function Navbar() {
    const navigate = useNavigate();

    function executarSair() {
        logout()
            .catch(() => {})
            .finally(() => navigate("/"));
    }

    return (
        <nav className={styles.navbar}>
            <LogoTitulo comMargem={false} />

            <ul className={styles.itens}>
                {itensMenu.map((item) => (
                    <li key={item.caminho}>
                        <NavLink
                            to={item.caminho}
                            className={({ isActive }) =>
                                isActive ? `${styles.link} ${styles.linkAtivo}` : styles.link
                            }
                        >
                            {item.rotulo}
                        </NavLink>
                    </li>
                ))}
            </ul>

            <div className={styles.perfil}>
                <Link to="/perfil" className={styles.perfilImagem} title="Meu perfil">
                    <img src={pfpImg} alt="Perfil" />
                </Link>
                <button
                    type="button"
                    className={styles.botaoSair}
                    onClick={executarSair}
                    aria-label="Sair"
                    title="Sair"
                >
                    <RxExit size={20} className={styles.iconeSair} />
                </button>
            </div>
        </nav>
    )
}

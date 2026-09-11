import styles from './navbar.module.css'
import { NavLink } from "react-router-dom";
import { RxExit } from "react-icons/rx";
import { LogoTitulo } from "../LoginCadastro/LogoTitulo";
import pfpImg from '../../assets/pfp.jpg'

const itensMenu = [
    { rotulo: "Visão geral", caminho: "/inicio" },
    { rotulo: "Planos", caminho: "/planos" },
    { rotulo: "Alunos", caminho: "/alunos" },
    { rotulo: "Turmas", caminho: "/turmas" },
    { rotulo: "Professores", caminho: "/professores" },
];

export function Navbar() {
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
                <a href="#" className={styles.perfilImagem}>
                    <img src={pfpImg} alt="Perfil" />
                </a>
                <RxExit size={20} className={styles.iconeSair} />
            </div>
        </nav>
    )
}

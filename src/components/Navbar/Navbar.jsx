import styles from './navbar.module.css'
import { RxExit } from "react-icons/rx";
import logoImg from '../../assets/logo.svg'
import pfpImg from '../../assets/pfp.jpg'

export function Navbar(props) {
    return (
        <nav className={styles.navbar}>
            <div>
                <a href="#">
                    <img src={logoImg} className={styles.logo} />
                </a>
            </div>
            <div className={styles.items}>
                <ul>
                    <li>
                        <a href="#">
                            Planos
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            Alunos
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            Turmas
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            Professores
                        </a>
                    </li>
                </ul>
            </div>
            <div className={styles.profile}>
                <a href="#" className={styles.profileImg}>
                    <img src={pfpImg}/>
                </a>
                <RxExit size={24} className={styles.exitIcon}/>
            </div>
        </nav>
    )
}
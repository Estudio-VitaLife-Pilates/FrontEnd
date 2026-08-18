import react from 'react';
import styles from './LogoTitulo.module.css';
import iconeSimples from '../../assets/iconeSimples.png';

export function LogoTitulo(){
    return(  <div className={styles["cabecalho-marca"]}>
                <div className={styles["fundo-icone-marca"]}>
                  <img className={styles["icone-marca"]} src={iconeSimples} alt="Ícone Logo" />
                </div>
                <div className={styles["texto-marca"]}>
                  <span className={styles["etiqueta-studio"]}>Studio</span>
                  <span className={styles["nome-marca"]}>Thais Almeida</span>
                </div>
              </div>    )

}

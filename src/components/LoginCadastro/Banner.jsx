import React from "react";
import styles from './Banner.module.css';
import padraoFlow from "../../assets/flow-pattern0.svg";
import logo from "../../assets/logo.svg";

export function Banner(){

    return(
           <div className={styles["lado-banner"]}>
            <img className={styles["padrao-banner"]} src={padraoFlow} alt="Pattern Background" />
            <div className={styles["circulo-decorativo-baixo"]}></div>
            <div className={styles["circulo-decorativo-cima"]}></div>
            <img className={styles["logo-banner"]} src={logo} alt="Logo" />
          </div>
    )
}

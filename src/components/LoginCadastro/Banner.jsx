import React from "react";
import './Banner.css';
export function Banner(){
  
    return(
           <div className="lado-banner">
            <img className="padrao-banner" src="src/assets/flow-pattern0.svg" alt="Pattern Background" />
            <div className="circulo-decorativo-baixo"></div>
            <div className="circulo-decorativo-cima"></div>
            <img className="logo-banner" src="src/assets/logo.svg" alt="Logo" />
          </div>
    )
}
import react from 'react';
import './LogoTitulo.css';

export function LogoTitulo(){
    return(  <div className="cabecalho-marca">
                <div className="fundo-icone-marca">
                  <img className="icone-marca" src="src/assets/iconeSimples.png" alt="Ícone Logo" />
                </div>
                <div className="texto-marca">
                  <span className="etiqueta-studio">Studio</span>
                  <span className="nome-marca">Thais Almeida</span>
                </div>
              </div>    )

}
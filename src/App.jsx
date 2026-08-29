import {Login} from './pages/Login/Login'
import Cadastro from './pages/Cadastro/Cadastro'
import Professores from './pages/Professores/Professores'
import DadosProfessor from './pages/DadosProfessor/DadosProfessor'
import Planos from './pages/Planos/Planos'
import { BrowserRouter, Routes, Route } from 'react-router-dom';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/cadastro" element={<Cadastro/>} />
        <Route path="/professores" element={<Professores/>} />
        <Route path="/professores/:id" element={<DadosProfessor/>} />
        <Route path="/planos" element={<Planos/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App

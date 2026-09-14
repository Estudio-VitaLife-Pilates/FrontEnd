import {Login} from './pages/Login/Login'
import Cadastro from './pages/Cadastro/Cadastro'
import Professores from './pages/Professores/Professores'
import DadosProfessor from './pages/DadosProfessor/DadosProfessor'
import Planos from './pages/Planos/Planos'
import Turmas from './pages/Turmas/Turmas'
import TurmaEspecifica from './pages/TurmaEspecifica/TurmaEspecifica'
import Alunos from './pages/Alunos/Alunos'
import DadosAluno from './pages/DadosAluno/DadosAluno'
import VisaoGeral from './pages/VisaoGeral/VisaoGeral'
import Perfil from './pages/Perfil/Perfil'
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
        <Route path="/turmas" element={<Turmas/>} />
        <Route path="/turmas/:id" element={<TurmaEspecifica/>} />
        <Route path="/alunos" element={<Alunos/>} />
        <Route path="/alunos/:id" element={<DadosAluno/>} />
        <Route path="/inicio" element={<VisaoGeral/>} />
        <Route path="/perfil" element={<Perfil/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App

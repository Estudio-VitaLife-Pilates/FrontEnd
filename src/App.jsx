import {Login} from './pages/Login/Login'
import Cadastro from './pages/Cadastro/Cadastro'
import Professores from './pages/Professores/Professores'
import { BrowserRouter, Routes, Route } from 'react-router-dom';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/cadastro" element={<Cadastro/>} />
        <Route path="/professores" element={<Professores/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App

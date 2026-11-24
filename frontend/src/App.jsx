import { Link, Route, Routes } from 'react-router-dom';
import EventosPage from './pages/EventosPage.jsx';
import EventoDetalhePage from './pages/EventoDetalhePage.jsx';

export default function App() {
  return (
    <>
      <header className="topbar">
        <div className="container topbar__inner">
          <Link to="/" className="brand">
            Agenda <span>UniJorge</span>
          </Link>
        </div>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<EventosPage />} />
          <Route path="/eventos/:eventoId" element={<EventoDetalhePage />} />
          <Route
            path="*"
            element={
              <section className="card">
                <h1>Página não encontrada</h1>
                <Link to="/">Voltar para os eventos</Link>
              </section>
            }
          />
        </Routes>
      </main>
    </>
  );
}

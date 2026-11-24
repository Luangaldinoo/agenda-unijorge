import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EventoForm from '../components/EventoForm.jsx';
import { atualizarEvento, criarEvento, excluirEvento, listarEventos } from '../api/eventos.js';
import { formatarData, pluralizar } from '../utils/format.js';

export default function EventosPage() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState(null);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [formulario, setFormulario] = useState(null); // null = fechado | {} = novo | evento = edição

  const carregar = useCallback(async () => {
    try {
      setEventos(await listarEventos());
      setErro('');
    } catch (e) {
      setErro(e.message);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvar(dados) {
    if (formulario?.id) {
      await atualizarEvento(formulario.id, dados);
      setFormulario(null);
      setAviso('Evento atualizado.');
      await carregar();
    } else {
      const criado = await criarEvento(dados);
      // Fluxo da regra de negócio: logo após cadastrar o evento, o usuário segue para adicionar participantes.
      navigate(`/eventos/${criado.id}`, { state: { recemCriado: true } });
    }
  }

  async function excluir(evento) {
    const mensagem = evento.totalParticipantes
      ? `Excluir o evento "${evento.titulo}" e seus ${pluralizar(evento.totalParticipantes, 'participante', 'participantes')}? Esta ação não pode ser desfeita.`
      : `Excluir o evento "${evento.titulo}"? Esta ação não pode ser desfeita.`;
    if (!window.confirm(mensagem)) return;
    try {
      await excluirEvento(evento.id);
      setAviso('Evento excluído.');
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Eventos</h1>
        {!formulario && (
          <button className="btn btn--primario" onClick={() => { setAviso(''); setFormulario({}); }}>
            Novo evento
          </button>
        )}
      </div>

      {aviso && <p className="alerta alerta--ok" role="status">{aviso}</p>}
      {erro && <p className="alerta alerta--erro" role="alert">{erro}</p>}

      {formulario && (
        <EventoForm
          key={formulario.id ?? 'novo'}
          inicial={formulario}
          onSubmit={salvar}
          onCancelar={() => setFormulario(null)}
        />
      )}

      {eventos === null && !erro && <p className="vazio">Carregando eventos…</p>}
      {eventos?.length === 0 && !formulario && (
        <p className="vazio">Nenhum evento cadastrado ainda. Clique em “Novo evento” para começar.</p>
      )}

      <ul className="lista">
        {eventos?.map((evento) => (
          <li key={evento.id} className="card evento">
            <div className="evento__info">
              <h2>
                <Link to={`/eventos/${evento.id}`}>{evento.titulo}</Link>
              </h2>
              <p className="meta">
                {formatarData(evento.data)}
                {evento.local && ` · ${evento.local}`}
              </p>
              {evento.descricao && <p>{evento.descricao}</p>}
            </div>
            <div className="evento__acoes">
              <span className="selo">{pluralizar(evento.totalParticipantes, 'participante', 'participantes')}</span>
              <Link className="btn btn--primario" to={`/eventos/${evento.id}`}>
                Participantes
              </Link>
              <button className="btn" onClick={() => { setAviso(''); setFormulario(evento); window.scrollTo({ top: 0 }); }}>
                Editar
              </button>
              <button className="btn btn--perigo" onClick={() => excluir(evento)}>
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

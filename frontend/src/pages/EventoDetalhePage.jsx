import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import ParticipanteForm from '../components/ParticipanteForm.jsx';
import { buscarEvento } from '../api/eventos.js';
import {
  atualizarParticipante,
  criarParticipante,
  excluirParticipante,
  listarParticipantes,
} from '../api/participantes.js';
import { formatarData, formatarTelefone, pluralizar, rotuloPagamento } from '../utils/format.js';

export default function EventoDetalhePage() {
  const { eventoId } = useParams();
  const { state } = useLocation();
  const recemCriado = Boolean(state?.recemCriado);

  const [evento, setEvento] = useState(null);
  const [participantes, setParticipantes] = useState(null);
  const [erro, setErro] = useState('');
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [aviso, setAviso] = useState(recemCriado ? 'Evento cadastrado! Agora adicione os participantes.' : '');
  // Logo após cadastrar o evento, já abrimos o formulário de participante.
  const [formulario, setFormulario] = useState(recemCriado ? {} : null); // null | {} (novo) | participante (edição)

  const carregar = useCallback(async () => {
    try {
      const [dadosEvento, lista] = await Promise.all([buscarEvento(eventoId), listarParticipantes(eventoId)]);
      setEvento(dadosEvento);
      setParticipantes(lista);
      setErro('');
    } catch (e) {
      if (e.status === 404) setNaoEncontrado(true);
      else setErro(e.message);
    }
  }, [eventoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvar(dados) {
    if (formulario?.id) {
      await atualizarParticipante(eventoId, formulario.id, dados);
      setAviso('Participante atualizado.');
    } else {
      await criarParticipante(eventoId, dados);
      setAviso('Participante adicionado ao evento.');
    }
    setFormulario(null);
    await carregar();
  }

  async function excluir(participante) {
    if (!window.confirm(`Remover "${participante.descricao}" deste evento?`)) return;
    try {
      await excluirParticipante(eventoId, participante.id);
      setAviso('Participante removido.');
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  if (naoEncontrado) {
    return (
      <section className="card">
        <h1>Evento não encontrado</h1>
        <p>Ele pode ter sido excluído.</p>
        <Link to="/">Voltar para os eventos</Link>
      </section>
    );
  }

  return (
    <>
      <p className="voltar">
        <Link to="/">← Todos os eventos</Link>
      </p>

      {erro && <p className="alerta alerta--erro" role="alert">{erro}</p>}
      {!evento && !erro && <p className="vazio">Carregando evento…</p>}

      {evento && (
        <section className="card evento-resumo">
          <h1>{evento.titulo}</h1>
          <p className="meta">
            {formatarData(evento.data)}
            {evento.local && ` · ${evento.local}`}
          </p>
          {evento.descricao && <p>{evento.descricao}</p>}
        </section>
      )}

      {evento && (
        <>
          <div className="page-head">
            <h2>
              Participantes{' '}
              <span className="selo">{pluralizar(participantes?.length ?? 0, 'inscrito', 'inscritos')}</span>
            </h2>
            {!formulario && (
              <button className="btn btn--primario" onClick={() => { setAviso(''); setFormulario({}); }}>
                Adicionar participante
              </button>
            )}
          </div>

          {aviso && <p className="alerta alerta--ok" role="status">{aviso}</p>}

          {formulario && (
            <ParticipanteForm
              key={formulario.id ?? 'novo'}
              inicial={formulario}
              onSubmit={salvar}
              onCancelar={() => setFormulario(null)}
            />
          )}

          {participantes?.length === 0 && !formulario && (
            <p className="vazio">Nenhum participante neste evento ainda.</p>
          )}

          {participantes?.length > 0 && (
            <div className="tabela-wrap card">
              <table>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>E-mail</th>
                    <th>Telefone</th>
                    <th>Pagamento</th>
                    <th>
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participantes.map((p) => (
                    <tr key={p.id}>
                      <td>{p.descricao}</td>
                      <td>{p.email}</td>
                      <td>{formatarTelefone(p.telefone)}</td>
                      <td>{rotuloPagamento(p.formaPagamento)}</td>
                      <td className="tabela__acoes">
                        <button className="btn btn--pequeno" onClick={() => { setAviso(''); setFormulario(p); }}>
                          Editar
                        </button>
                        <button className="btn btn--pequeno btn--perigo" onClick={() => excluir(p)}>
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}

import { useState } from 'react';
import Field from './Field.jsx';
import { ApiError } from '../api/client.js';

const VAZIO = { titulo: '', data: '', local: '', descricao: '' };

export default function EventoForm({ inicial, onSubmit, onCancelar }) {
  const [valores, setValores] = useState({ ...VAZIO, ...inicial });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const editando = Boolean(inicial?.id);

  const alterar = (campo) => (e) => setValores((v) => ({ ...v, [campo]: e.target.value }));

  async function enviar(e) {
    e.preventDefault();
    const novosErros = {};
    if (!valores.titulo.trim()) novosErros.titulo = 'Título é obrigatório';
    if (!valores.data) novosErros.data = 'Data é obrigatória';
    setErros(novosErros);
    setErroGeral('');
    if (Object.keys(novosErros).length) return;

    setEnviando(true);
    try {
      await onSubmit({
        titulo: valores.titulo,
        data: valores.data,
        local: valores.local,
        descricao: valores.descricao,
      });
    } catch (erro) {
      if (erro instanceof ApiError && erro.detalhes.length) setErros(erro.errosPorCampo);
      else setErroGeral(erro.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="card form" onSubmit={enviar} noValidate>
      <h2>{editando ? 'Editar evento' : 'Novo evento'}</h2>
      {erroGeral && (
        <p className="alerta alerta--erro" role="alert">
          {erroGeral}
        </p>
      )}
      <div className="grid-2">
        <Field rotulo="Título" erro={erros.titulo} obrigatorio>
          {(props) => <input {...props} value={valores.titulo} onChange={alterar('titulo')} maxLength={150} />}
        </Field>
        <Field rotulo="Data" erro={erros.data} obrigatorio>
          {(props) => <input {...props} type="date" value={valores.data} onChange={alterar('data')} />}
        </Field>
      </div>
      <Field rotulo="Local" erro={erros.local}>
        {(props) => <input {...props} value={valores.local ?? ''} onChange={alterar('local')} maxLength={150} />}
      </Field>
      <Field rotulo="Descrição" erro={erros.descricao}>
        {(props) => <textarea {...props} rows={3} value={valores.descricao ?? ''} onChange={alterar('descricao')} />}
      </Field>
      <div className="acoes">
        <button type="submit" className="btn btn--primario" disabled={enviando}>
          {enviando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Cadastrar evento'}
        </button>
        <button type="button" className="btn" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

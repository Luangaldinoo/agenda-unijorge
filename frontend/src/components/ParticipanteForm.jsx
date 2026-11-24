import { useState } from 'react';
import Field from './Field.jsx';
import { ApiError } from '../api/client.js';
import { FORMAS_PAGAMENTO, formatarTelefone } from '../utils/format.js';

const VAZIO = { descricao: '', email: '', telefone: '', formaPagamento: '' };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Espelha as regras do backend para dar retorno imediato; o servidor continua sendo a fonte da verdade.
function validar(v) {
  const erros = {};
  if (!v.descricao.trim()) erros.descricao = 'Descrição é obrigatória';
  if (!v.email.trim()) erros.email = 'E-mail é obrigatório';
  else if (!EMAIL_REGEX.test(v.email.trim())) erros.email = 'E-mail inválido';
  const digitos = v.telefone.replace(/\D/g, '');
  if (!digitos) erros.telefone = 'Telefone é obrigatório';
  else if (digitos.length < 10 || digitos.length > 11) erros.telefone = 'Telefone deve ter 10 ou 11 dígitos (DDD + número)';
  if (!v.formaPagamento) erros.formaPagamento = 'Forma de pagamento é obrigatória';
  return erros;
}

export default function ParticipanteForm({ inicial, onSubmit, onCancelar }) {
  const [valores, setValores] = useState({
    ...VAZIO,
    ...inicial,
    telefone: formatarTelefone(inicial?.telefone),
  });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const editando = Boolean(inicial?.id);

  const alterar = (campo) => (e) => setValores((v) => ({ ...v, [campo]: e.target.value }));
  const alterarTelefone = (e) => setValores((v) => ({ ...v, telefone: formatarTelefone(e.target.value) }));

  async function enviar(e) {
    e.preventDefault();
    const novosErros = validar(valores);
    setErros(novosErros);
    setErroGeral('');
    if (Object.keys(novosErros).length) return;

    setEnviando(true);
    try {
      await onSubmit({
        descricao: valores.descricao,
        email: valores.email,
        telefone: valores.telefone,
        formaPagamento: valores.formaPagamento,
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
      <h2>{editando ? 'Editar participante' : 'Adicionar participante'}</h2>
      {erroGeral && (
        <p className="alerta alerta--erro" role="alert">
          {erroGeral}
        </p>
      )}
      <Field rotulo="Descrição" erro={erros.descricao} obrigatorio>
        {(props) => (
          <input
            {...props}
            value={valores.descricao}
            onChange={alterar('descricao')}
            maxLength={255}
            placeholder="Ex.: Maria Souza — Estudante de ADS"
          />
        )}
      </Field>
      <div className="grid-2">
        <Field rotulo="E-mail" erro={erros.email} obrigatorio>
          {(props) => <input {...props} type="email" value={valores.email} onChange={alterar('email')} />}
        </Field>
        <Field rotulo="Telefone" erro={erros.telefone} obrigatorio>
          {(props) => (
            <input
              {...props}
              type="tel"
              inputMode="numeric"
              value={valores.telefone}
              onChange={alterarTelefone}
              placeholder="(71) 99999-9999"
            />
          )}
        </Field>
      </div>
      <Field rotulo="Forma de pagamento" erro={erros.formaPagamento} obrigatorio>
        {(props) => (
          <select {...props} value={valores.formaPagamento} onChange={alterar('formaPagamento')}>
            <option value="">Selecione…</option>
            {FORMAS_PAGAMENTO.map((f) => (
              <option key={f.valor} value={f.valor}>
                {f.rotulo}
              </option>
            ))}
          </select>
        )}
      </Field>
      <div className="acoes">
        <button type="submit" className="btn btn--primario" disabled={enviando}>
          {enviando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Adicionar participante'}
        </button>
        <button type="button" className="btn" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

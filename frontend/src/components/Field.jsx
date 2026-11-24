import { useId } from 'react';

// Rótulo + controle + mensagem de erro, ligados por id/aria para leitores de tela.
export default function Field({ rotulo, erro, obrigatorio = false, children }) {
  const id = useId();
  const controle = children({ id, 'aria-invalid': Boolean(erro), 'aria-describedby': erro ? `${id}-erro` : undefined });
  return (
    <div className={`field${erro ? ' field--erro' : ''}`}>
      <label htmlFor={id}>
        {rotulo}
        {obrigatorio && <span className="obrigatorio"> *</span>}
      </label>
      {controle}
      {erro && (
        <p id={`${id}-erro`} className="field__erro" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

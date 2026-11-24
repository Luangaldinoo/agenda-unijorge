export const FORMAS_PAGAMENTO = [
  { valor: 'PIX', rotulo: 'Pix' },
  { valor: 'CARTAO_CREDITO', rotulo: 'Cartão de crédito' },
  { valor: 'CARTAO_DEBITO', rotulo: 'Cartão de débito' },
  { valor: 'DINHEIRO', rotulo: 'Dinheiro' },
  { valor: 'BOLETO', rotulo: 'Boleto' },
];

export const rotuloPagamento = (valor) => FORMAS_PAGAMENTO.find((f) => f.valor === valor)?.rotulo ?? valor;

// '2026-12-10' -> '10/12/2026' (sem passar por Date, para não sofrer deslocamento de fuso).
export function formatarData(iso) {
  if (!iso) return '';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

// '71999991234' -> '(71) 99999-1234'; funciona também enquanto o usuário digita.
export function formatarTelefone(valor) {
  const d = String(valor ?? '').replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const pluralizar = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;

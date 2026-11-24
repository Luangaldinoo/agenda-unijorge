import { api } from './client.js';

// Participantes sempre são acessados dentro do contexto de um evento.
const base = (eventoId) => `/eventos/${eventoId}/participantes`;

export const listarParticipantes = (eventoId) => api(base(eventoId));
export const criarParticipante = (eventoId, dados) => api(base(eventoId), { method: 'POST', body: dados });
export const atualizarParticipante = (eventoId, id, dados) =>
  api(`${base(eventoId)}/${id}`, { method: 'PUT', body: dados });
export const excluirParticipante = (eventoId, id) => api(`${base(eventoId)}/${id}`, { method: 'DELETE' });

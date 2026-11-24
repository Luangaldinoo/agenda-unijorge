import { api } from './client.js';

export const listarEventos = () => api('/eventos');
export const buscarEvento = (id) => api(`/eventos/${id}`);
export const criarEvento = (dados) => api('/eventos', { method: 'POST', body: dados });
export const atualizarEvento = (id, dados) => api(`/eventos/${id}`, { method: 'PUT', body: dados });
export const excluirEvento = (id) => api(`/eventos/${id}`, { method: 'DELETE' });

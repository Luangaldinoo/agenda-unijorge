export class ApiError extends Error {
  constructor(message, status = 0, detalhes = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detalhes = detalhes; // [{ campo, mensagem }] vindo da validação do backend
  }

  // Mapa { campo: mensagem } para exibir o erro junto de cada input.
  get errosPorCampo() {
    return Object.fromEntries(this.detalhes.map((d) => [d.campo, d.mensagem]));
  }
}

export async function api(caminho, { method = 'GET', body } = {}) {
  let resposta;
  try {
    resposta = await fetch(`/api${caminho}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique se a API está em execução.');
  }

  if (resposta.status === 204) return null;

  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    throw new ApiError(dados?.erro || 'Erro inesperado', resposta.status, dados?.detalhes || []);
  }
  return dados;
}

process.env.DB_STORAGE = ':memory:';

const { test, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const createApp = require('../src/app');
const { sequelize, Participante } = require('../src/models');

const app = createApp();

const eventoValido = { titulo: 'Semana de Tecnologia', descricao: 'Palestras e oficinas', local: 'Auditório', data: '2026-12-10' };
const participanteValido = {
  descricao: 'Maria Souza - Estudante de ADS',
  email: 'maria@exemplo.com',
  telefone: '(71) 99999-1234',
  formaPagamento: 'PIX',
};

const criarEvento = async (dados = eventoValido) => (await request(app).post('/api/eventos').send(dados)).body;
const criarParticipante = async (eventoId, dados = participanteValido) =>
  request(app).post(`/api/eventos/${eventoId}/participantes`).send(dados);

before(async () => {
  await sequelize.sync({ force: true });
});

beforeEach(async () => {
  await sequelize.sync({ force: true });
});

after(async () => {
  await sequelize.close();
});

test('cadastra um evento e informa 0 participantes', async () => {
  const res = await request(app).post('/api/eventos').send(eventoValido);
  assert.equal(res.status, 201);
  assert.equal(res.body.titulo, 'Semana de Tecnologia');
  assert.equal(res.body.totalParticipantes, 0);
});

test('evento sem título ou data é rejeitado', async () => {
  const res = await request(app).post('/api/eventos').send({ local: 'Sala 1' });
  assert.equal(res.status, 400);
  const campos = res.body.detalhes.map((d) => d.campo).sort();
  assert.deepEqual(campos, ['data', 'titulo']);
});

test('cadastra participante vinculado automaticamente ao evento da URL', async () => {
  const evento = await criarEvento();
  const res = await criarParticipante(evento.id);
  assert.equal(res.status, 201);
  assert.equal(res.body.eventoId, evento.id);
  assert.equal(res.body.telefone, '71999991234', 'telefone é guardado só com dígitos');
  assert.equal(res.body.email, 'maria@exemplo.com');
});

test('eventoId enviado no corpo é ignorado (vínculo vem sempre da URL)', async () => {
  const a = await criarEvento();
  const b = await criarEvento({ ...eventoValido, titulo: 'Outro evento' });
  const res = await criarParticipante(a.id, { ...participanteValido, eventoId: b.id });
  assert.equal(res.status, 201);
  assert.equal(res.body.eventoId, a.id);
});

for (const campo of ['descricao', 'email', 'telefone', 'formaPagamento']) {
  test(`campo obrigatório ausente: ${campo}`, async () => {
    const evento = await criarEvento();
    const dados = { ...participanteValido };
    delete dados[campo];
    const res = await criarParticipante(evento.id, dados);
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.detalhes.map((d) => d.campo), [campo]);
  });

  test(`campo obrigatório em branco: ${campo}`, async () => {
    const evento = await criarEvento();
    const res = await criarParticipante(evento.id, { ...participanteValido, [campo]: '   ' });
    assert.equal(res.status, 400);
    assert.ok(res.body.detalhes.some((d) => d.campo === campo));
  });
}

test('valida formato de e-mail, telefone e forma de pagamento', async () => {
  const evento = await criarEvento();
  const email = await criarParticipante(evento.id, { ...participanteValido, email: 'sem-arroba' });
  const telefone = await criarParticipante(evento.id, { ...participanteValido, telefone: '123' });
  const pagamento = await criarParticipante(evento.id, { ...participanteValido, formaPagamento: 'CHEQUE' });
  assert.equal(email.status, 400);
  assert.equal(telefone.status, 400);
  assert.equal(pagamento.status, 400);
});

test('não cadastra participante em evento inexistente', async () => {
  const res = await criarParticipante(9999);
  assert.equal(res.status, 404);
  assert.equal(await Participante.count(), 0);
});

test('lista somente os participantes do evento consultado', async () => {
  const a = await criarEvento();
  const b = await criarEvento({ ...eventoValido, titulo: 'Outro evento' });
  await criarParticipante(a.id);
  await criarParticipante(a.id, { ...participanteValido, email: 'joao@exemplo.com' });
  await criarParticipante(b.id, { ...participanteValido, email: 'ana@exemplo.com' });

  const listaA = await request(app).get(`/api/eventos/${a.id}/participantes`);
  const listaB = await request(app).get(`/api/eventos/${b.id}/participantes`);
  assert.equal(listaA.body.length, 2);
  assert.equal(listaB.body.length, 1);
  assert.ok(listaA.body.every((p) => p.eventoId === a.id));

  const eventos = (await request(app).get('/api/eventos')).body;
  const totais = Object.fromEntries(eventos.map((e) => [e.id, e.totalParticipantes]));
  assert.deepEqual(totais, { [a.id]: 2, [b.id]: 1 });
});

test('consulta, edita e exclui um participante', async () => {
  const evento = await criarEvento();
  const { body: criado } = await criarParticipante(evento.id);
  const base = `/api/eventos/${evento.id}/participantes/${criado.id}`;

  const consulta = await request(app).get(base);
  assert.equal(consulta.status, 200);
  assert.equal(consulta.body.email, 'maria@exemplo.com');

  const edicao = await request(app)
    .put(base)
    .send({ ...participanteValido, descricao: 'Maria Souza - Palestrante', formaPagamento: 'DINHEIRO' });
  assert.equal(edicao.status, 200);
  assert.equal(edicao.body.descricao, 'Maria Souza - Palestrante');
  assert.equal(edicao.body.formaPagamento, 'DINHEIRO');
  assert.equal(edicao.body.eventoId, evento.id);

  const exclusao = await request(app).delete(base);
  assert.equal(exclusao.status, 204);
  assert.equal((await request(app).get(base)).status, 404);
});

test('edição também exige os campos obrigatórios e não permite trocar o evento', async () => {
  const a = await criarEvento();
  const b = await criarEvento({ ...eventoValido, titulo: 'Outro evento' });
  const { body: criado } = await criarParticipante(a.id);
  const base = `/api/eventos/${a.id}/participantes/${criado.id}`;

  const semEmail = await request(app).put(base).send({ ...participanteValido, email: '' });
  assert.equal(semEmail.status, 400);

  const tentaMover = await request(app).put(base).send({ ...participanteValido, eventoId: b.id });
  assert.equal(tentaMover.status, 200);
  assert.equal(tentaMover.body.eventoId, a.id);
});

test('participante só é acessível pelo evento ao qual pertence', async () => {
  const a = await criarEvento();
  const b = await criarEvento({ ...eventoValido, titulo: 'Outro evento' });
  const { body: criado } = await criarParticipante(a.id);
  const pelaRotaErrada = `/api/eventos/${b.id}/participantes/${criado.id}`;

  assert.equal((await request(app).get(pelaRotaErrada)).status, 404);
  assert.equal((await request(app).put(pelaRotaErrada).send(participanteValido)).status, 404);
  assert.equal((await request(app).delete(pelaRotaErrada)).status, 404);
  assert.equal(await Participante.count(), 1, 'o participante continua existindo no evento correto');
});

test('excluir o evento exclui seus participantes (cascade)', async () => {
  const a = await criarEvento();
  const b = await criarEvento({ ...eventoValido, titulo: 'Outro evento' });
  await criarParticipante(a.id);
  await criarParticipante(a.id, { ...participanteValido, email: 'joao@exemplo.com' });
  await criarParticipante(b.id);

  const res = await request(app).delete(`/api/eventos/${a.id}`);
  assert.equal(res.status, 204);
  assert.equal(await Participante.count({ where: { eventoId: a.id } }), 0);
  assert.equal(await Participante.count({ where: { eventoId: b.id } }), 1);
});

test('ids inválidos e JSON malformado retornam erros claros', async () => {
  assert.equal((await request(app).get('/api/eventos/abc')).status, 404);
  assert.equal((await request(app).get('/api/eventos/abc/participantes')).status, 404);
  const res = await request(app).post('/api/eventos').set('Content-Type', 'application/json').send('{ruim');
  assert.equal(res.status, 400);
});

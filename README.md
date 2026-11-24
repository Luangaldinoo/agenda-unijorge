# Agenda UniJorge

Sistema de agenda de eventos com gerenciamento de **participantes dentro do contexto de cada evento**.

- **Backend:** Node.js + Express 5 + Sequelize (SQLite)
- **Frontend:** React 19 + Vite + React Router

## Regra de negócio

Um **Evento** possui vários **Participantes** — relacionamento **1:N (One-to-Many)**.

1. O usuário cadastra o evento.
2. Logo após o cadastro, o sistema leva o usuário à página do evento, já com o formulário para adicionar participantes aberto.
3. Todo participante cadastrado fica **automaticamente vinculado ao evento** em que foi criado.
4. Na página do evento, o usuário consulta, edita e exclui os participantes daquele evento.

Campos obrigatórios do participante: **Descrição**, **E-mail**, **Telefone** e **Forma de pagamento**.

### Como a regra é garantida

| Garantia | Onde |
| --- | --- |
| Participante nunca existe sem evento (`eventoId` obrigatório, chave estrangeira) | `backend/src/models/index.js` |
| O vínculo vem **sempre da URL** (`/eventos/:eventoId/participantes`); um `eventoId` enviado no corpo é ignorado | `backend/src/services/participanteService.js` |
| Um participante só é acessível pelo evento ao qual pertence (consulta, edição e exclusão buscam por `id` **e** `eventoId`; outro evento → 404) | `backend/src/services/participanteService.js` |
| Excluir um evento exclui seus participantes (`ON DELETE CASCADE`) | `backend/src/models/index.js` |
| Campos obrigatórios validados no servidor (fonte da verdade) e no formulário (retorno imediato), inclusive na **edição** | `backend/src/models/Participante.js`, `frontend/src/components/ParticipanteForm.jsx` |

## Modelo de dados

```
Evento (1) ───────< (N) Participante

Evento:        id, titulo*, data*, local, descricao
Participante:  id, descricao*, email*, telefone*, formaPagamento*, eventoId* (FK -> Evento)
```

`*` obrigatório. `formaPagamento`: `PIX`, `CARTAO_CREDITO`, `CARTAO_DEBITO`, `DINHEIRO` ou `BOLETO`.
O telefone é armazenado apenas com dígitos (10 ou 11, com DDD); o frontend aplica a máscara. O e-mail é normalizado em minúsculas.

## API

Base: `http://localhost:3333/api`

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/eventos` | Lista eventos (com `totalParticipantes`) |
| POST | `/eventos` | Cadastra evento |
| GET | `/eventos/:id` | Consulta evento |
| PUT | `/eventos/:id` | Edita evento |
| DELETE | `/eventos/:id` | Exclui evento e seus participantes |
| GET | `/eventos/:eventoId/participantes` | Lista os participantes do evento |
| POST | `/eventos/:eventoId/participantes` | Adiciona participante ao evento |
| GET | `/eventos/:eventoId/participantes/:id` | Consulta participante |
| PUT | `/eventos/:eventoId/participantes/:id` | Edita participante |
| DELETE | `/eventos/:eventoId/participantes/:id` | Exclui participante |

Exemplo:

```bash
curl -X POST http://localhost:3333/api/eventos/1/participantes \
  -H 'Content-Type: application/json' \
  -d '{"descricao":"Maria Souza - Estudante de ADS","email":"maria@exemplo.com","telefone":"(71) 99999-1234","formaPagamento":"PIX"}'
```

Erros seguem um formato único: `404 { "erro": "Evento não encontrado" }` e
`400 { "erro": "Dados inválidos", "detalhes": [{ "campo": "email", "mensagem": "E-mail inválido" }] }`.

## Como executar

Pré-requisito: Node.js 20 ou superior.

```bash
# 1) Backend (http://localhost:3333)
cd backend
npm install
npm run dev        # ou: npm start

# 2) Frontend (http://localhost:5173) — em outro terminal
cd frontend
npm install
npm run dev
```

O Vite encaminha as chamadas `/api` para o backend, então não há configuração extra. O banco SQLite é criado automaticamente em `backend/data/agenda.sqlite`.

Variáveis opcionais do backend: `PORT` (padrão `3333`), `DB_STORAGE` (caminho do arquivo SQLite), `CORS_ORIGIN`.
Para apontar o frontend para outra API: `VITE_API_URL=http://host:porta npm run dev`.

## Testes

```bash
cd backend
npm test           # 20 testes de integração (node:test + supertest, banco em memória)
```

Cobrem o cadastro de eventos e participantes, os quatro campos obrigatórios, os formatos de e-mail/telefone/pagamento, o vínculo automático com o evento, o isolamento entre eventos, edição, exclusão e o cascade.

## Arquitetura

```
backend/src
├── config/        conexão com o banco
├── models/        Evento, Participante e a associação 1:N
├── services/      regras de negócio (vínculo, busca por evento, edição)
├── controllers/   camada HTTP, sem regra de negócio
├── routes/        /eventos e o sub-recurso /eventos/:eventoId/participantes
└── middlewares/   tratamento de erros e validação de ids

frontend/src
├── api/           chamadas HTTP (uma função por operação)
├── pages/         EventosPage (lista/CRUD de eventos) e EventoDetalhePage (participantes do evento)
├── components/    EventoForm, ParticipanteForm, Field
└── utils/         formatação de data, telefone e forma de pagamento
```

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FORMAS_PAGAMENTO = ['PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO', 'BOLETO'];

const trim = (campo) =>
  function setter(valor) {
    this.setDataValue(campo, typeof valor === 'string' ? valor.trim() : valor);
  };

const Participante = sequelize.define(
  'Participante',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // Campos obrigatórios do cadastro de participante.
    descricao: {
      type: DataTypes.STRING(255),
      allowNull: false,
      set: trim('descricao'),
      validate: {
        notNull: { msg: 'Descrição é obrigatória' },
        notEmpty: { msg: 'Descrição é obrigatória' },
        len: { args: [1, 255], msg: 'Descrição deve ter no máximo 255 caracteres' },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      set(valor) {
        this.setDataValue('email', typeof valor === 'string' ? valor.trim().toLowerCase() : valor);
      },
      validate: {
        notNull: { msg: 'E-mail é obrigatório' },
        notEmpty: { msg: 'E-mail é obrigatório' },
        isEmail: { msg: 'E-mail inválido' },
      },
    },
    telefone: {
      type: DataTypes.STRING(11),
      allowNull: false,
      // Guardamos apenas os dígitos; a formatação fica por conta do frontend.
      set(valor) {
        this.setDataValue('telefone', typeof valor === 'string' ? valor.replace(/\D/g, '') : valor);
      },
      validate: {
        notNull: { msg: 'Telefone é obrigatório' },
        notEmpty: { msg: 'Telefone é obrigatório' },
        is: { args: /^\d{10,11}$/, msg: 'Telefone deve ter 10 ou 11 dígitos (DDD + número)' },
      },
    },
    formaPagamento: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notNull: { msg: 'Forma de pagamento é obrigatória' },
        isIn: {
          args: [FORMAS_PAGAMENTO],
          msg: `Forma de pagamento inválida (use: ${FORMAS_PAGAMENTO.join(', ')})`,
        },
      },
    },
    // A chave estrangeira eventoId é criada pela associação (ver models/index.js).
  },
  { tableName: 'participantes' }
);

Participante.FORMAS_PAGAMENTO = FORMAS_PAGAMENTO;

module.exports = Participante;

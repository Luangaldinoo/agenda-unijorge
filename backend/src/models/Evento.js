const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const trim = (campo) =>
  function setter(valor) {
    this.setDataValue(campo, typeof valor === 'string' ? valor.trim() : valor);
  };

const Evento = sequelize.define(
  'Evento',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      set: trim('titulo'),
      validate: {
        notNull: { msg: 'Título é obrigatório' },
        notEmpty: { msg: 'Título é obrigatório' },
        len: { args: [1, 150], msg: 'Título deve ter no máximo 150 caracteres' },
      },
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
      set: trim('descricao'),
    },
    local: {
      type: DataTypes.STRING(150),
      allowNull: true,
      set: trim('local'),
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: { msg: 'Data é obrigatória' },
        isDate: { args: true, msg: 'Data inválida (use o formato AAAA-MM-DD)' },
      },
    },
  },
  { tableName: 'eventos' }
);

module.exports = Evento;

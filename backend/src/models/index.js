const sequelize = require('../config/database');
const Evento = require('./Evento');
const Participante = require('./Participante');

// Relacionamento 1:N — um Evento possui vários Participantes.
// eventoId é obrigatório: não existe participante "solto", ele sempre pertence a um evento.
// Ao excluir o evento, seus participantes são excluídos junto (CASCADE).
Evento.hasMany(Participante, {
  as: 'participantes',
  foreignKey: { name: 'eventoId', allowNull: false },
  onDelete: 'CASCADE',
  hooks: true,
});
Participante.belongsTo(Evento, {
  as: 'evento',
  foreignKey: { name: 'eventoId', allowNull: false },
  onDelete: 'CASCADE',
});

module.exports = { sequelize, Evento, Participante };

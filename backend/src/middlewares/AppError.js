// Erro de negócio com status HTTP associado (ex.: 404 evento não encontrado).
class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

module.exports = AppError;

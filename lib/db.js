// Conexão com o Neon (Postgres serverless). A DATABASE_URL vem de uma
// variável de ambiente configurada na Vercel — nunca fica no código.
// Veja SETUP.md para como pegar essa string no console do Neon.
const { neon } = require('@neondatabase/serverless');

let cliente = null;

function sql() {
  if (cliente) return cliente;
  if (!process.env.DATABASE_URL) {
    const err = new Error(
      'DATABASE_URL não configurada. Veja SETUP.md — o painel precisa dessa variável de ambiente na Vercel pra falar com o Neon.'
    );
    err.statusCode = 500;
    throw err;
  }
  cliente = neon(process.env.DATABASE_URL);
  return cliente;
}

module.exports = { sql };

// Autenticação de verdade: senha com hash (bcrypt) e sessão como token opaco
// guardado num cookie httpOnly (o JavaScript do navegador nunca lê esse
// cookie — só o backend). O token fica numa tabela no banco, então dá pra
// revogar sessões na hora (ex.: deletar todas as linhas de um usuário
// força o logout dele em todo lugar).
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const cookie = require('cookie');
const { sql } = require('./db');

const COOKIE_NAME = 'inscope_sessao';
const SESSAO_DIAS = 30;

async function hashSenha(senha) {
  return bcrypt.hash(senha, 10);
}

async function verificarSenha(senha, hash) {
  return bcrypt.compare(senha, hash);
}

function gerarToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function criarSessao(usuarioId) {
  const db = sql();
  const token = gerarToken();
  const expiraEm = new Date(Date.now() + SESSAO_DIAS * 24 * 60 * 60 * 1000);
  await db`insert into sessoes (token, usuario_id, expira_em) values (${token}, ${usuarioId}, ${expiraEm})`;
  return token;
}

async function getUsuarioDaSessao(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  const db = sql();
  const linhas = await db`
    select u.id, u.nome, u.email, u.papel, u.empresa_id as "empresaId"
    from sessoes s
    join usuarios u on u.id = s.usuario_id
    where s.token = ${token} and s.expira_em > now()
  `;
  return linhas[0] || null;
}

async function destruirSessaoAtual(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return;
  const db = sql();
  await db`delete from sessoes where token = ${token}`;
}

function setCookieSessao(res, token) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSAO_DIAS * 24 * 60 * 60
    })
  );
}

function limparCookieSessao(res) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(COOKIE_NAME, '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    })
  );
}

module.exports = {
  hashSenha,
  verificarSenha,
  criarSessao,
  getUsuarioDaSessao,
  destruirSessaoAtual,
  setCookieSessao,
  limparCookieSessao
};

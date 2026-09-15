const { withAuth } = require('../../lib/http');
const { sql } = require('../../lib/db');
const { hashSenha } = require('../../lib/auth');

module.exports = withAuth(async function (req, res) {
  const db = sql();
  const { id } = req.query;

  const [alvo] = await db`select id, empresa_id as "empresaId", papel from usuarios where id = ${id}`;
  if (!alvo) {
    res.status(404).json({ error: 'Usuário não encontrado.' });
    return;
  }
  const podeGerenciar =
    req.usuario.papel === 'agencia_admin' ||
    (req.usuario.papel === 'empresa_admin' && alvo.empresaId === req.usuario.empresaId);
  if (!podeGerenciar) {
    res.status(403).json({ error: 'Sem permissão.' });
    return;
  }

  if (req.method === 'PATCH') {
    const { senha, papel, nome } = req.body || {};
    if (senha) {
      const hash = await hashSenha(senha);
      await db`update usuarios set senha_hash = ${hash} where id = ${id}`;
    }
    if (nome) {
      await db`update usuarios set nome = ${nome} where id = ${id}`;
    }
    if (papel && req.usuario.papel === 'agencia_admin') {
      await db`update usuarios set papel = ${papel} where id = ${id}`;
    }
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method === 'DELETE') {
    if (alvo.id === req.usuario.id) {
      res.status(400).json({ error: 'Você não pode remover o próprio usuário logado.' });
      return;
    }
    if (alvo.papel !== 'membro') {
      const contagem =
        alvo.empresaId === null
          ? await db`select count(*)::int as c from usuarios where empresa_id is null and papel = 'agencia_admin'`
          : await db`select count(*)::int as c from usuarios where empresa_id = ${alvo.empresaId} and papel = 'empresa_admin'`;
      if (contagem[0].c <= 1) {
        res.status(400).json({ error: 'Não é possível remover o último administrador.' });
        return;
      }
    }
    await db`delete from usuarios where id = ${id}`;
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
});

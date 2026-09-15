const { withAuth, resolverEmpresaId } = require('../../lib/http');
const { sql } = require('../../lib/db');
const { hashSenha } = require('../../lib/auth');

module.exports = withAuth(async function (req, res) {
  const db = sql();

  if (req.method === 'GET') {
    const empresaId = resolverEmpresaId(req.usuario, req.query.empresaId);
    const usuarios =
      empresaId === null
        ? await db`select id, nome, email, papel, empresa_id as "empresaId" from usuarios where empresa_id is null order by nome`
        : await db`select id, nome, email, papel, empresa_id as "empresaId" from usuarios where empresa_id = ${empresaId} order by nome`;
    res.status(200).json({ usuarios });
    return;
  }

  if (req.method === 'POST') {
    if (!['agencia_admin', 'empresa_admin'].includes(req.usuario.papel)) {
      res.status(403).json({ error: 'Sem permissão pra criar usuário.' });
      return;
    }
    const { nome, email, senha, papel } = req.body || {};
    if (!nome || !email || !senha) {
      res.status(400).json({ error: 'Preencha nome, e-mail e senha.' });
      return;
    }
    const empresaId = resolverEmpresaId(req.usuario, req.body.empresaId);
    // Papel final é decidido pelo backend, nunca só pelo que o body manda —
    // sem isso, um payload adulterado poderia tentar criar um agencia_admin
    // dentro de uma empresa-cliente.
    let papelFinal = 'membro';
    if (empresaId === null) {
      // sem empresa selecionada = cadastrando alguém da própria agência
      papelFinal = 'agencia_admin';
    } else if (papel === 'empresa_admin') {
      papelFinal = 'empresa_admin';
    }
    const senhaHash = await hashSenha(senha);
    try {
      const linhas = await db`
        insert into usuarios (nome, email, senha_hash, papel, empresa_id)
        values (${nome}, ${email}, ${senhaHash}, ${papelFinal}, ${empresaId})
        returning id, nome, email, papel, empresa_id as "empresaId"
      `;
      res.status(201).json({ usuario: linhas[0] });
    } catch (e) {
      if (String(e.message).toLowerCase().includes('unique')) {
        res.status(409).json({ error: 'Já existe um usuário com esse e-mail.' });
        return;
      }
      throw e;
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
});

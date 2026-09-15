const { withAuth, resolverEmpresaId } = require('../lib/http');
const { sql } = require('../lib/db');

module.exports = withAuth(async function (req, res) {
  const db = sql();
  const empresaId = resolverEmpresaId(req.usuario, req.query.empresaId || (req.body && req.body.empresaId));
  if (!empresaId) {
    res.status(400).json({ error: 'Selecione uma empresa.' });
    return;
  }

  if (req.method === 'GET') {
    const ideias = await db`
      select id, texto, usado, criado_em as "criadoEm"
      from banco_ideias where empresa_id = ${empresaId}
      order by criado_em desc
    `;
    res.status(200).json({ ideias });
    return;
  }

  if (req.method === 'POST') {
    const { action, texto, id } = req.body || {};
    if (action === 'apagar') {
      await db`delete from banco_ideias where id = ${id} and empresa_id = ${empresaId}`;
      res.status(200).json({ ok: true });
      return;
    }
    if (action === 'usar') {
      await db`update banco_ideias set usado = true where id = ${id} and empresa_id = ${empresaId}`;
      res.status(200).json({ ok: true });
      return;
    }
    if (!texto) {
      res.status(400).json({ error: 'Escreva o texto da ideia.' });
      return;
    }
    const linhas = await db`
      insert into banco_ideias (empresa_id, texto) values (${empresaId}, ${texto})
      returning id, texto, usado, criado_em as "criadoEm"
    `;
    res.status(201).json({ ideia: linhas[0] });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
});

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
    const links = await db`
      select id, url, tag, criado_em as "criadoEm"
      from banco_links where empresa_id = ${empresaId}
      order by criado_em desc
    `;
    res.status(200).json({ links });
    return;
  }

  if (req.method === 'POST') {
    const { action, url, tag, id } = req.body || {};
    if (action === 'apagar') {
      await db`delete from banco_links where id = ${id} and empresa_id = ${empresaId}`;
      res.status(200).json({ ok: true });
      return;
    }
    if (!url) {
      res.status(400).json({ error: 'Informe a URL do link.' });
      return;
    }
    const linhas = await db`
      insert into banco_links (empresa_id, url, tag) values (${empresaId}, ${url}, ${tag || null})
      returning id, url, tag, criado_em as "criadoEm"
    `;
    res.status(201).json({ link: linhas[0] });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
});

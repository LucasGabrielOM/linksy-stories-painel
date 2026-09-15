const { withAuth, resolverEmpresaId } = require('../lib/http');
const { sql } = require('../lib/db');

module.exports = withAuth(async function (req, res) {
  const db = sql();
  const empresaId = resolverEmpresaId(req.usuario, req.query.empresaId);
  if (!empresaId) {
    res.status(400).json({ error: 'Selecione uma empresa.' });
    return;
  }
  const linhas = await db`
    select id, dia
    from stories_historico where empresa_id = ${empresaId}
    order by dia desc
  `;
  const stories = linhas.map((l) => ({ id: l.id, dia: String(l.dia) }));
  res.status(200).json({ stories });
});

// Atualiza dados da empresa, incluindo a configuração do Windsor.ai
// (chave de API, conector e id da conta) usada pra buscar os dados do
// Instagram dela em /api/instagram-dados.
const { withAuth } = require('../../lib/http');
const { sql } = require('../../lib/db');

module.exports = withAuth(
  async function (req, res) {
    const db = sql();
    const { id } = req.query;

    if (req.method === 'PATCH') {
      const body = req.body || {};
      await db`
        update empresas set
          nome = coalesce(${body.nome ?? null}, nome),
          windsor_api_key = coalesce(${body.windsorApiKey ?? null}, windsor_api_key),
          windsor_connector = coalesce(${body.windsorConnector ?? null}, windsor_connector),
          windsor_account_id = coalesce(${body.windsorAccountId ?? null}, windsor_account_id)
        where id = ${id}
      `;
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'DELETE') {
      await db`delete from empresas where id = ${id}`;
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  },
  { papeis: ['agencia_admin'] }
);

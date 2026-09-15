const { withAuth } = require('../../lib/http');
const { sql } = require('../../lib/db');

module.exports = withAuth(
  async function (req, res) {
    const db = sql();

    if (req.method === 'GET') {
      const empresas = await db`
        select id, nome, slug, criado_em as "criadoEm",
               (windsor_api_key is not null) as "instagramConectado"
        from empresas
        order by nome
      `;
      res.status(200).json({ empresas });
      return;
    }

    if (req.method === 'POST') {
      const { nome, slug } = req.body || {};
      if (!nome || !slug) {
        res.status(400).json({ error: 'Informe nome e um identificador (slug) pra empresa.' });
        return;
      }
      try {
        const linhas = await db`
          insert into empresas (nome, slug) values (${nome}, ${slug})
          returning id, nome, slug
        `;
        res.status(201).json({ empresa: linhas[0] });
      } catch (e) {
        if (String(e.message).toLowerCase().includes('unique')) {
          res.status(409).json({ error: 'Já existe uma empresa com esse identificador.' });
          return;
        }
        throw e;
      }
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  },
  { papeis: ['agencia_admin'] }
);

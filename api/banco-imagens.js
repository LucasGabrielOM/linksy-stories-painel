// O front-end já comprime a imagem no navegador (canvas, ~1280px no lado
// maior) e manda como um data URL base64 em `dataUrl` — guardamos esse
// texto direto na coluna `url`. Funciona bem pro volume de uma equipe de
// conteúdo; se o banco de imagens crescer muito, vale migrar pra um storage
// de arquivo de verdade (ex.: Vercel Blob) e guardar só a URL curta aqui.
const { withAuth, resolverEmpresaId } = require('../lib/http');
const { sql } = require('../lib/db');

const TAMANHO_MAXIMO = 2 * 1024 * 1024; // ~2MB de base64 (já vem comprimida pelo front)

module.exports = withAuth(async function (req, res) {
  const db = sql();
  const empresaId = resolverEmpresaId(req.usuario, req.query.empresaId || (req.body && req.body.empresaId));
  if (!empresaId) {
    res.status(400).json({ error: 'Selecione uma empresa.' });
    return;
  }

  if (req.method === 'GET') {
    const imagens = await db`
      select id, url, tag, criado_em as "criadoEm"
      from banco_imagens where empresa_id = ${empresaId}
      order by criado_em desc
    `;
    res.status(200).json({ imagens });
    return;
  }

  if (req.method === 'POST') {
    const { action, dataUrl, tag, id } = req.body || {};
    if (action === 'apagar') {
      await db`delete from banco_imagens where id = ${id} and empresa_id = ${empresaId}`;
      res.status(200).json({ ok: true });
      return;
    }
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      res.status(400).json({ error: 'Imagem inválida.' });
      return;
    }
    if (dataUrl.length > TAMANHO_MAXIMO) {
      res.status(400).json({ error: 'Imagem grande demais mesmo depois de comprimida.' });
      return;
    }
    const linhas = await db`
      insert into banco_imagens (empresa_id, url, tag) values (${empresaId}, ${dataUrl}, ${tag || null})
      returning id, url, tag, criado_em as "criadoEm"
    `;
    res.status(201).json({ imagem: linhas[0] });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
});

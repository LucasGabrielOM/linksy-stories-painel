// Busca os números do Instagram da empresa através do Windsor.ai — a
// chave de API, o conector e o id da conta ficam salvos por empresa (veja
// api/empresas/[id].js), nunca no front-end.
//
// IMPORTANTE: não tenho acesso à sua conta Windsor.ai, então não sei o
// nome exato do conector nem o formato exato da resposta da sua conta —
// ajuste CONNECTOR_URL_BASE e o mapeamento em `resumoDe()` conforme o que
// aparecer no seu painel Windsor (Settings > API). Veja SETUP.md.
const { withAuth, resolverEmpresaId } = require('../lib/http');
const { sql } = require('../lib/db');

const CONNECTOR_URL_BASE = 'https://connectors.windsor.ai';

function resumoDe(dadosWindsor, datePreset) {
  // Ajuste esse mapeamento pro formato real que sua conta Windsor devolve.
  const linhas = Array.isArray(dadosWindsor && dadosWindsor.data) ? dadosWindsor.data : [];
  return {
    periodo: datePreset,
    diasComDados: linhas.length,
    seguidores: linhas.length ? linhas[linhas.length - 1].followers ?? null : null,
    alcancePosts: linhas.reduce((soma, l) => soma + (l.reach || 0), 0) || null,
    engajamentoPosts: linhas.reduce((soma, l) => soma + (l.engagement || 0), 0) || null
  };
}

module.exports = withAuth(async function (req, res) {
  const db = sql();
  const empresaId = resolverEmpresaId(req.usuario, req.query.empresaId);
  if (!empresaId) {
    res.status(400).json({ error: 'Selecione uma empresa.' });
    return;
  }

  const [empresa] = await db`
    select windsor_api_key as "apiKey", windsor_connector as connector, windsor_account_id as "accountId"
    from empresas where id = ${empresaId}
  `;
  if (!empresa || !empresa.apiKey) {
    res.status(200).json({ configurado: false, resumo: null });
    return;
  }

  const datePreset = req.query.date_preset || 'last_7d';
  const url =
    `${CONNECTOR_URL_BASE}/${encodeURIComponent(empresa.connector || 'instagram-business')}` +
    `?api_key=${encodeURIComponent(empresa.apiKey)}` +
    `&date_preset=${encodeURIComponent(datePreset)}` +
    (empresa.accountId ? `&account_id=${encodeURIComponent(empresa.accountId)}` : '');

  try {
    const resp = await fetch(url);
    const dados = await resp.json();
    if (!resp.ok) {
      res.status(502).json({ configurado: true, error: 'Windsor.ai respondeu com erro.', detalhe: dados });
      return;
    }
    res.status(200).json({ configurado: true, resumo: resumoDe(dados, datePreset), bruto: dados });
  } catch (e) {
    res.status(502).json({ configurado: true, error: 'Não consegui falar com o Windsor.ai: ' + e.message });
  }
});

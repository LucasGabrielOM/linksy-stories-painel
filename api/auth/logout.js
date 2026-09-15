const { destruirSessaoAtual, limparCookieSessao } = require('../../lib/auth');

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    await destruirSessaoAtual(req);
  } catch (e) {
    // mesmo se o banco falhar aqui, ainda limpa o cookie do navegador
  }
  limparCookieSessao(res);
  res.status(200).json({ ok: true });
};

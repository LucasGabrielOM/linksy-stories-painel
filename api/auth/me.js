// Chamado pelo front no carregamento da página pra saber se já existe uma
// sessão válida (cookie httpOnly) e, se for admin da agência, trazer a
// lista de empresas pro seletor do topo.
const { getUsuarioDaSessao } = require('../../lib/auth');
const { sql } = require('../../lib/db');

module.exports = async function (req, res) {
  try {
    const usuario = await getUsuarioDaSessao(req);
    if (!usuario) {
      res.status(401).json({ error: 'Não autenticado.' });
      return;
    }
    let empresas = [];
    if (usuario.papel === 'agencia_admin') {
      const db = sql();
      empresas = await db`select id, nome, slug from empresas order by nome`;
    }
    res.status(200).json({ usuario, empresas });
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
};

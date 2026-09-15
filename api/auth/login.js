const { sql } = require('../../lib/db');
const { verificarSenha, criarSessao, setCookieSessao } = require('../../lib/auth');

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { email, senha } = req.body || {};
    if (!email || !senha) {
      res.status(400).json({ error: 'Informe e-mail e senha.' });
      return;
    }
    const db = sql();
    const linhas = await db`
      select id, nome, email, senha_hash as "senhaHash", papel, empresa_id as "empresaId"
      from usuarios
      where lower(email) = lower(${email})
    `;
    const usuario = linhas[0];
    if (!usuario) {
      res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      return;
    }
    const senhaOk = await verificarSenha(senha, usuario.senhaHash);
    if (!senhaOk) {
      res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      return;
    }
    const token = await criarSessao(usuario.id);
    setCookieSessao(res, token);
    res.status(200).json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        empresaId: usuario.empresaId
      }
    });
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
};

// Wrapper comum pras rotas de API: exige login (e opcionalmente um papel
// específico) antes de rodar o handler, e converte erros em resposta JSON
// em vez de derrubar a função sem explicação.
const { getUsuarioDaSessao } = require('./auth');

function withAuth(handler, opcoes) {
  opcoes = opcoes || {};
  return async function (req, res) {
    let usuario;
    try {
      usuario = await getUsuarioDaSessao(req);
    } catch (e) {
      res.status(e.statusCode || 500).json({ error: e.message });
      return;
    }
    if (!usuario) {
      res.status(401).json({ error: 'Não autenticado.' });
      return;
    }
    if (opcoes.papeis && !opcoes.papeis.includes(usuario.papel)) {
      res.status(403).json({ error: 'Sem permissão pra isso.' });
      return;
    }
    req.usuario = usuario;
    try {
      await handler(req, res);
    } catch (e) {
      res.status(e.statusCode || 500).json({ error: e.message || 'Erro interno.' });
    }
  };
}

// Qual empresa uma requisição deve enxergar: usuário de empresa sempre vê a
// própria; usuário da agência escolhe via ?empresaId= (o front manda isso
// quando a agência troca de empresa no seletor do topo).
function resolverEmpresaId(usuario, empresaIdSolicitado) {
  if (usuario.papel === 'agencia_admin') return empresaIdSolicitado || null;
  return usuario.empresaId;
}

module.exports = { withAuth, resolverEmpresaId };

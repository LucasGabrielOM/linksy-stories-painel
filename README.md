# InScope Marketing — Painel de Stories

Painel de planejamento de Stories, multi-empresa: a agência InScope Marketing
gerencia várias empresas-cliente, cada uma com seus próprios usuários e sua
própria conexão de Instagram.

**Pra colocar isso no ar do zero (Neon + Vercel), siga o [SETUP.md](SETUP.md).**

## Arquitetura

- **Front-end**: página única (`index.html`), sem build — HTML, CSS e
  JavaScript num arquivo só. Ícones são um sprite SVG inline; fontes
  (Archivo, Inter, Source Serif 4) via Google Fonts.
- **Backend**: funções serverless em `api/*.js`, hospedadas na Vercel.
- **Banco**: Postgres no [Neon](https://neon.tech), schema em
  [`db/schema.sql`](db/schema.sql).
- **Instagram**: dados buscados via [Windsor.ai](https://windsor.ai)
  (`api/instagram-dados.js`), com a chave/config guardada por empresa.

## Modelo de dados: agência > empresas > usuários

- **Agência** (`empresa_id = null`, papel `agencia_admin`): enxerga e
  gerencia todas as empresas-cliente. Troca entre elas pelo seletor no topo
  do painel.
- **Empresa-cliente**: tem seus próprios usuários (`empresa_admin` ou
  `membro`) e seu próprio conteúdo (ideias, imagens, links, histórico de
  stories) — nunca visível pra outra empresa.

## Autenticação

Login de verdade: senha com hash (bcrypt), sessão como token opaco num
cookie `httpOnly` (nunca lido pelo JavaScript do navegador), validada no
backend a cada chamada de API. Nada de senha ou sessão fica no
`localStorage` nem no código-fonte.

O primeiro usuário (admin da agência) é criado rodando um SQL diretamente no
Neon — veja o passo 2 do [SETUP.md](SETUP.md).

## Navegação

- **Visão Geral** — estado da semana da empresa selecionada
- **Planejamento** — Escala de Stories → Grade da Semana → Roteiro de Gravação
- **Conteúdo** — Banco de Ideias, Narrativas da Semana, Formatos InScope, Banco de Imagens
- **Resultados** — Diagnóstico, Performance
- **Administração** — Empresas (só agência) e Usuários

## Design

Linguagem visual "liquid glass": painéis translúcidos com blur, cantos bem
arredondados, sombras suaves, sem emojis — ícones SVG lineares no lugar. A
paleta segue o site [InScope Tech](https://lucasgabrielom.github.io/InScopeTech/):

| Token | Cor |
|---|---|
| `--ink` | `#1d1d1f` |
| `--ink-soft` | `#6e6e73` |
| `--paper` | `#eef0ee` |
| `--panel` | `rgba(255,255,255,.6)` (glass) |
| `--line` | `rgba(29,29,31,.09)` |
| `--accent` | `#2f5d50` |

Tipografia: **Archivo** (peso 800/900) para títulos, **Inter** para corpo de
texto, **Source Serif 4** itálico para o destaque de marca.

## Rodando localmente

```bash
npm install
```

O front-end (`index.html`) abre direto no navegador, mas as chamadas
`/api/*` só funcionam rodando via `vercel dev` (com `DATABASE_URL` num
`.env.local`) ou já publicado na Vercel — veja o [SETUP.md](SETUP.md).

## O que ainda não está aqui

Gerar sequência de Stories com IA, criar tarefas no ClickUp e o diagnóstico
automático da semana existiam no protótipo anterior mas dependem de outras
chaves de API (LLM, ClickUp) que ainda não foram configuradas — os botões
correspondentes no painel vão dar erro até isso ser feito. Detalhes no fim
do [SETUP.md](SETUP.md).

## Origem

Este projeto começou como uma cópia do painel publicado em
https://linksy-stories-painel.vercel.app/, foi rebatizado com a identidade
da InScope Marketing e depois reconstruído com autenticação e banco de
dados reais para suportar várias empresas-cliente.

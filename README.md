# InScope Marketing — Painel de Stories

Painel semanal de planejamento de Stories: distribuição da semana, grade,
roteiro de gravação, escala, banco de ideias, narrativas, formatos, banco de
imagens, diagnóstico do estrategista e performance.

## Navegação

A barra lateral é agrupada pela ordem real do fluxo de trabalho:

- **Visão Geral** — painel do estado da semana
- **Planejamento** — Escala de Stories → Grade da Semana → Roteiro de Gravação
- **Conteúdo** — Banco de Ideias, Narrativas da Semana, Formatos InScope, Banco de Imagens
- **Resultados** — Diagnóstico, Performance

## Estrutura

O painel é uma **página única, autocontida**: todo o HTML, CSS e JavaScript
vivem em [`index.html`](index.html). Os ícones são um sprite SVG inline (sem
biblioteca externa); as fontes (Archivo, Inter e Source Serif 4) são
carregadas via Google Fonts. Não há build nem dependências.

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

Basta abrir `index.html` no navegador. Para servir por HTTP:

```bash
python -m http.server 8000
```

E acessar http://localhost:8000

## Backend

O painel consome endpoints relativos (`/api/...`) que **não fazem parte deste
repositório** — são serverless functions (histórico de stories, banco de
ideias/imagens/links, dados do Instagram, integração com ClickUp etc.). Sem
esse backend, as views carregam mas os dados aparecem como indisponíveis.

## Deploy

Qualquer host de site estático serve o front-end. Na Vercel, importe o
repositório e aceite os padrões — sem framework, sem comando de build,
diretório de saída na raiz. As rotas `/api/*` precisam ser recriadas à parte.

## Origem

O front-end deste repositório foi importado do painel publicado em
https://linksy-stories-painel.vercel.app/ e rebatizado com a identidade da
InScope Marketing.

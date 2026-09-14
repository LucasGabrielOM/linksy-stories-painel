# Linksy Stories — Painel

Painel semanal de planejamento de Stories da Linksy: distribuição da semana,
grade, roteiro de gravação, escala, banco de ideias, narrativas, formatos,
banco de imagens, diagnóstico do estrategista e performance.

## Estrutura

O painel é uma **página única, autocontida**: todo o HTML, CSS, JavaScript e as
fontes (embutidas em base64) vivem em [`index.html`](index.html). Não há build,
dependências nem chamadas a assets externos.

## Rodando localmente

Basta abrir `index.html` no navegador. Para servir por HTTP:

```bash
python -m http.server 8000
```

E acessar http://localhost:8000

## Deploy

Qualquer host de site estático serve. Na Vercel, importe o repositório e aceite
os padrões — sem framework, sem comando de build, diretório de saída na raiz.

## Origem

Este repositório foi criado a partir do painel publicado em
https://linksy-stories-painel.vercel.app/

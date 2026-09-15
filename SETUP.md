# Colocando o painel no ar (Neon + Vercel)

Este guia parte do zero: você ainda não tem o Neon nem a Vercel conectados a
este projeto. São ~15 minutos.

## 1. Criar o banco no Neon

1. Vá em https://neon.tech e crie uma conta (dá pra entrar com o GitHub).
2. Crie um projeto novo (Create a project). Qualquer nome serve, ex.
   `inscope-marketing`.
3. Nele, entre em **SQL Editor** (menu lateral).
4. Cole o conteúdo de [`db/schema.sql`](db/schema.sql) inteiro e rode (▶ Run).
   Isso cria todas as tabelas.
5. Ainda no projeto, vá em **Connection Details** / **Dashboard** e copie a
   **connection string** (formato `postgresql://usuario:senha@host/banco?sslmode=require`).
   Guarde isso — é o valor que vai virar a variável `DATABASE_URL` no passo 3.

## 2. Criar o primeiro usuário (admin da agência)

Você precisa gerar o hash da senha antes de inserir o usuário — nunca insira
a senha em texto puro no banco.

1. Na pasta do projeto, no seu computador, rode:
   ```bash
   npm install
   node -e "require('bcryptjs').hash(process.argv[1], 10).then(console.log)" "escolha-uma-senha-forte"
   ```
2. Isso imprime um hash começando com `$2a$10$...`. Copie ele.
3. Abra [`db/seed-admin.sql`](db/seed-admin.sql), troque o e-mail e cole o
   hash no lugar de `$2a$10$COLE_AQUI_O_HASH_GERADO`.
4. Cole o SQL editado no **SQL Editor** do Neon e rode.
5. Guarde o e-mail e a senha que você escolheu — é com isso que você entra
   no painel pela primeira vez.

## 3. Importar o projeto na Vercel

1. Em https://vercel.com, **Add New > Project** e importe o repositório
   `LucasGabrielOM/linksy-stories-painel` do GitHub.
2. Framework Preset: **Other**. Build Command: vazio. Output Directory: raiz
   (deixe os padrões).
3. Antes de clicar em Deploy, abra **Environment Variables** e adicione:
   - `DATABASE_URL` → a connection string do passo 1.5
4. Clique em **Deploy**.

Se o projeto já estava importado na Vercel de antes (sem essas rotas), vá em
**Project Settings > Environment Variables**, adicione `DATABASE_URL` e
depois **Deployments > ⋯ > Redeploy**.

## 4. Testar o login

Acesse a URL da Vercel, entre com o e-mail/senha do passo 2. Você deve cair
no painel como **Admin da agência**, com o grupo **Administração** visível
na barra lateral (Empresas + Usuários).

## 5. Cadastrar a primeira empresa-cliente

1. **Administração > Empresas > Nova empresa**. Nome e um identificador
   (slug) qualquer.
2. Clique em **Configurar** na empresa criada pra conectar o Instagram dela
   via Windsor.ai (veja o passo 6).
3. Use o seletor que aparece no topo do painel (ao lado da semana) pra
   entrar na visão dessa empresa e cadastrar os usuários dela em
   **Administração > Usuários**.

## 6. Conectar o Instagram de uma empresa (Windsor.ai)

1. Entre em https://windsor.ai e conecte a conta do Instagram Business da
   empresa-cliente (siga o fluxo deles de autorização com a Meta).
2. Em **Settings > API** no painel da Windsor, pegue sua **API key**.
3. Anote também o nome do **conector** que a Windsor usa pra Instagram (varia
   conforme o produto contratado — geralmente algo como `instagram` ou
   `instagram-business`) e o **account id** da conta conectada.
4. No painel InScope, em **Administração > Empresas**, clique em
   **Configurar** na empresa e preencha esses três campos.

⚠️ **Isso ainda precisa de um ajuste seu depois de conectar**: eu não tenho
acesso à sua conta Windsor.ai, então não sei o formato exato da resposta que
ela devolve para essa conta/plano. Depois de configurar, abra a Visão Geral
do painel — se os números do Instagram não aparecerem certos, me mostre o
que a Windsor está te devolvendo (a aba Network do navegador, chamada
`/api/instagram-dados`) que eu ajusto o mapeamento em
[`api/instagram-dados.js`](api/instagram-dados.js).

## O que ainda não foi migrado

Estes recursos existiam no protótipo antigo e **ainda apontam pra rotas que
não existem neste backend** — vão dar erro se você clicar neles agora:

- **Gerar sequência com IA** (Banco de Ideias) — precisa de uma chave de API
  de LLM (Claude/OpenAI) por empresa ou compartilhada.
- **Criar tarefas no ClickUp** (Escala de Stories) — precisa de uma chave de
  API do ClickUp por empresa.
- **Avaliar semana** (Diagnóstico) — depende do gerador de IA acima.
- **Ler agenda da semana** — dependia de uma integração de calendário que
  não foi portada.

Nenhum desses precisa de decisão agora — me avise quando quiser esse
próximo pedaço e a gente resolve as credenciais junto.

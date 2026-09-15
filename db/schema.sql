-- Schema do painel InScope Marketing — multi-empresa.
-- Rode isso uma vez no SQL Editor do seu projeto Neon (https://console.neon.tech)
-- antes de configurar a DATABASE_URL na Vercel. Veja SETUP.md para o passo a passo.

create extension if not exists pgcrypto;

-- Empresas-cliente que a agência atende. Cada uma tem sua própria configuração
-- de Instagram (via Windsor.ai) e seus próprios usuários/conteúdo.
create table if not exists empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  windsor_api_key text,
  windsor_connector text default 'instagram-business',
  windsor_account_id text,
  criado_em timestamptz not null default now()
);

-- Usuários. empresa_id nulo = usuário da agência (papel 'agencia_admin'),
-- enxerga e gerencia todas as empresas. Usuários com empresa_id preenchido
-- só enxergam a própria empresa.
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas(id) on delete cascade,
  nome text not null,
  email text not null unique,
  senha_hash text not null,
  papel text not null check (papel in ('agencia_admin', 'empresa_admin', 'membro')),
  criado_em timestamptz not null default now()
);
create index if not exists idx_usuarios_empresa on usuarios(empresa_id);

-- Sessões de login (token opaco, não JWT — dá pra revogar na hora deletando a linha).
create table if not exists sessoes (
  token text primary key,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null
);
create index if not exists idx_sessoes_usuario on sessoes(usuario_id);

-- Banco de ideias (temas de Stories em aberto).
create table if not exists banco_ideias (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  texto text not null,
  usado boolean not null default false,
  criado_em timestamptz not null default now()
);
create index if not exists idx_ideias_empresa on banco_ideias(empresa_id);

-- Banco de imagens (por enquanto guarda a URL da imagem já hospedada em algum
-- lugar — upload direto de arquivo é um passo seguinte, veja SETUP.md).
create table if not exists banco_imagens (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  url text not null,
  tag text,
  criado_em timestamptz not null default now()
);
create index if not exists idx_imagens_empresa on banco_imagens(empresa_id);

-- Links de referência (pastas de fotos, Pinterest etc.).
create table if not exists banco_links (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  url text not null,
  tag text,
  criado_em timestamptz not null default now()
);
create index if not exists idx_links_empresa on banco_links(empresa_id);

-- Histórico de Stories já postados (alimenta o card "Stories postados" da
-- Visão Geral). Populado manualmente por enquanto — sincronizar com o
-- Instagram de verdade é um passo seguinte.
create table if not exists stories_historico (
  id text not null,
  empresa_id uuid not null references empresas(id) on delete cascade,
  dia date not null,
  criado_em timestamptz not null default now(),
  primary key (id, empresa_id)
);
create index if not exists idx_historico_empresa on stories_historico(empresa_id);

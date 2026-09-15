-- Cria o primeiro usuário da agência (agencia_admin), pra você conseguir
-- entrar no painel pela primeira vez. Rode isso UMA VEZ no SQL Editor do
-- Neon, DEPOIS do schema.sql, e TROQUE o e-mail/senha antes de rodar.
--
-- O hash abaixo é só um placeholder — gere o seu com o comando no fim deste
-- arquivo antes de rodar este INSERT. Veja o passo 5 do SETUP.md.

insert into usuarios (nome, email, senha_hash, papel, empresa_id)
values (
  'Administrador',
  'admin@inscopemarketing.com',
  '$2a$10$COLE_AQUI_O_HASH_GERADO',
  'agencia_admin',
  null
);

-- Como gerar o hash da sua senha (rode isso no seu computador, com Node
-- instalado, dentro da pasta do projeto depois de `npm install`):
--
--   node -e "require('bcryptjs').hash(process.argv[1], 10).then(console.log)" "sua-senha-aqui"
--
-- Copie a saída (começa com $2a$10$...) e cole no lugar de
-- $2a$10$COLE_AQUI_O_HASH_GERADO acima antes de rodar o INSERT.

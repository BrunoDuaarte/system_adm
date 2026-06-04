# Sistema Administrativo — Next.js + Supabase

Sistema web administrativo com autenticação, perfis de acesso, permissões e logs de auditoria.

## Link de acesso

https://system-adm-jeag.vercel.app/login

## Credenciais de acesso

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | admin@sistema.com | Admin@123 |

## Stack
- Next.js 15 (App Router + Server Actions)
- Supabase (PostgreSQL + Auth + RLS)
- TypeScript
- Tailwind CSS
- Deploy: Vercel

## Módulos
- Login com autenticação segura
- Dashboard com visão geral
- Gerenciamento de usuários (criar, editar, excluir)
- Perfis de acesso (admin, gerente, operador, visualizador)
- Gerenciador de permissões pelo painel
- Relatórios e gráficos
- Notificações do sistema
- Configurações do sistema
- Logs de auditoria completos

## Branches
- `main` — produção (deploy automático na Vercel)
- `desenvolvimento` — branch de desenvolvimento

## Rodando localmente

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Copie `.env.example` para `.env.local` e preencha as variáveis
4. Execute os SQLs em `sql/` no Supabase
5. Rode: `npm run dev`

# Projeto Next.js + Supabase
Sistema administrativo com autenticação, perfis de acesso, permissões e logs de auditoria.

---

## Stack
- **Next.js 15** (App Router + Server Actions)
- **Supabase** (PostgreSQL + Auth + RLS)
- **TypeScript**
- **Tailwind CSS**

---

## Estrutura de pastas

```
src/
├── app/
│   ├── login/
│   │   ├── page.tsx        ← Tela de login
│   │   └── actions.ts      ← Server Actions de auth
│   ├── dashboard/
│   │   └── page.tsx        ← Dashboard principal
│   ├── usuarios/
│   │   └── page.tsx        ← Lista de usuários
│   └── logs/
│       └── page.tsx        ← Logs de auditoria
├── lib/
│   ├── supabase/
│   │   ├── client.ts       ← Client para o navegador
│   │   └── server.ts       ← Client para o servidor
│   ├── auth.ts             ← getSession, requirePermission
│   └── audit.ts            ← Função de log
├── services/
│   ├── users.ts            ← CRUD de usuários
│   └── logs.ts             ← Listagem de logs
├── types/
│   └── index.ts            ← Tipos TypeScript
└── middleware.ts            ← Proteção de rotas

sql/
├── 01_schema.sql            ← Cria as tabelas
├── 02_seed.sql              ← Dados iniciais (roles e permissões)
└── 03_rls.sql               ← Row Level Security
```

---

## Passo a passo para rodar

### 1. Criar o projeto Supabase
1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **SQL Editor** e execute os arquivos nessa ordem:
   - `sql/01_schema.sql`
   - `sql/02_seed.sql`
   - `sql/03_rls.sql`

### 2. Criar o primeiro usuário admin
No **SQL Editor** do Supabase, após cadastrar um usuário via Authentication → Users, execute:
```sql
UPDATE public.profiles
SET role_id = '00000000-0000-0000-0000-000000000001'  -- role admin
WHERE email = 'seu@email.com';
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
```
Preencha com as chaves do seu projeto Supabase (Settings → API).

### 4. Instalar dependências e rodar
```bash
npm install
npm run dev
```
Acesse: [http://localhost:3000](http://localhost:3000)

---

## Como funciona a autorização

Cada rota e Server Action verifica permissões antes de executar:

```typescript
// No servidor — bloqueia se não tiver permissão
const session = await requirePermission('users.create')

// No frontend — esconde elementos sem permissão
{session.permissions.includes('users.create') && <button>Criar</button>}
```

### Permissões disponíveis
| Chave | Descrição |
|---|---|
| `users.view` | Ver lista de usuários |
| `users.create` | Criar usuários |
| `users.update` | Editar usuários |
| `users.delete` | Excluir usuários |
| `roles.view` | Ver perfis de acesso |
| `roles.create` | Criar perfis |
| `roles.update` | Editar perfis |
| `roles.delete` | Excluir perfis |
| `logs.view` | Ver logs de auditoria |
| `logs.export` | Exportar logs |
| `dashboard.view` | Acessar o dashboard |

### Perfis pré-configurados
| Perfil | Permissões |
|---|---|
| admin | Todas |
| gerente | view + create + logs |
| operador | view + update |
| visualizador | view apenas |

---

## Deploy (Vercel)
1. Suba o código para o GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Adicione as variáveis de ambiente no painel da Vercel
4. Deploy automático a cada push na branch main

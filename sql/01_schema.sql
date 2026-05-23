-- ============================================================
-- SCHEMA PRINCIPAL — Execute no SQL Editor do Supabase
-- ============================================================

-- 1. TABELA DE PERFIS DE ACESSO (roles)
CREATE TABLE public.roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TABELA DE PERMISSÕES
CREATE TABLE public.permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,  -- ex: "users.create"
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. RELACIONAMENTO ROLE <-> PERMISSÃO
CREATE TABLE public.role_permissions (
  role_id       UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 4. PERFIS DOS USUÁRIOS (vinculado ao auth.users)
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  role_id    UUID REFERENCES public.roles(id),
  status     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. LOGS DE AUDITORIA
CREATE TABLE public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,        -- ex: "create", "update", "delete"
  resource    TEXT NOT NULL,        -- ex: "users", "roles"
  resource_id TEXT,
  metadata    JSONB DEFAULT '{}',
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================
CREATE INDEX idx_profiles_role_id    ON public.profiles(role_id);
CREATE INDEX idx_audit_logs_user_id  ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created  ON public.audit_logs(created_at DESC);
CREATE INDEX idx_role_permissions_role ON public.role_permissions(role_id);

-- ============================================================
-- TRIGGER: atualiza updated_at automaticamente em profiles
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- TRIGGER: cria profile automaticamente ao cadastrar usuário
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

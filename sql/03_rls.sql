-- ============================================================
-- ROW LEVEL SECURITY — Execute após o 02_seed.sql
-- ============================================================

-- Ativa RLS em todas as tabelas
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs      ENABLE ROW LEVEL SECURITY;

-- PROFILES: usuário autenticado vê apenas o próprio perfil
-- Admins veem todos (via service_role key no servidor)
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- ROLES: qualquer autenticado pode ler (necessário para exibir o nome do perfil)
CREATE POLICY "roles_select_authenticated"
  ON public.roles FOR SELECT
  TO authenticated
  USING (true);

-- PERMISSIONS: qualquer autenticado pode ler
CREATE POLICY "permissions_select_authenticated"
  ON public.permissions FOR SELECT
  TO authenticated
  USING (true);

-- ROLE_PERMISSIONS: qualquer autenticado pode ler
CREATE POLICY "role_permissions_select_authenticated"
  ON public.role_permissions FOR SELECT
  TO authenticated
  USING (true);

-- AUDIT_LOGS: usuário vê apenas seus próprios logs
-- Admins acessam todos via service_role no servidor
CREATE POLICY "audit_logs_select_own"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Apenas o servidor (service_role) pode inserir logs
CREATE POLICY "audit_logs_insert_service"
  ON public.audit_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

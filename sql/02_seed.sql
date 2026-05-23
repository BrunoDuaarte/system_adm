-- ============================================================
-- DADOS INICIAIS — Execute após o 01_schema.sql
-- ============================================================

-- PERFIS DE ACESSO
INSERT INTO public.roles (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin',       'Acesso total ao sistema'),
  ('00000000-0000-0000-0000-000000000002', 'gerente',     'Gerencia usuários e relatórios'),
  ('00000000-0000-0000-0000-000000000003', 'operador',    'Operações do dia a dia'),
  ('00000000-0000-0000-0000-000000000004', 'visualizador','Apenas leitura');

-- PERMISSÕES DO SISTEMA
INSERT INTO public.permissions (key, description) VALUES
  ('users.view',        'Visualizar lista de usuários'),
  ('users.create',      'Criar novos usuários'),
  ('users.update',      'Editar dados de usuários'),
  ('users.delete',      'Excluir usuários'),
  ('roles.view',        'Visualizar perfis de acesso'),
  ('roles.create',      'Criar perfis de acesso'),
  ('roles.update',      'Editar perfis de acesso'),
  ('roles.delete',      'Excluir perfis de acesso'),
  ('logs.view',         'Visualizar logs de auditoria'),
  ('logs.export',       'Exportar logs de auditoria'),
  ('dashboard.view',    'Acessar o dashboard');

-- PERMISSÕES DO ADMIN (todas)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM public.permissions;

-- PERMISSÕES DO GERENTE
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id
FROM public.permissions
WHERE key IN ('users.view','users.create','users.update','roles.view','logs.view','dashboard.view');

-- PERMISSÕES DO OPERADOR
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id
FROM public.permissions
WHERE key IN ('users.view','users.update','dashboard.view');

-- PERMISSÕES DO VISUALIZADOR
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id
FROM public.permissions
WHERE key IN ('users.view','dashboard.view');

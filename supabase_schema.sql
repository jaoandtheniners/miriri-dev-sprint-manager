-- ============================================================
-- SGM Sprint Manager — Schema do banco de dados (Supabase)
-- Execute isso no SQL Editor do seu projeto Supabase
-- ============================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABELAS
-- ============================================================

create table sprints (
  id         uuid primary key default uuid_generate_v4(),
  name       text,
  start_date date not null,
  end_date   date not null,
  status     text not null default 'PLANEJADA' check (status in ('ATIVA','ENCERRADA','PLANEJADA')),
  created_at timestamptz default now()
);

create table tasks (
  id             uuid primary key default uuid_generate_v4(),
  sprint_id      uuid references sprints(id) on delete set null,
  title          text not null,
  type           text not null default 'NEW' check (type in ('NEW','BUG','ATT','EXTRA')),
  classification text check (classification in ('FE','BE','BD','SI','EX')),
  priority       text not null default 'MEDIA' check (priority in ('URGENTE','ALTA','MEDIA','BAIXA')),
  module         text,
  developer      text check (developer in ('Israel','João Vitor','Antonia','Outro')),
  status         text not null default 'PENDENTE' check (status in ('PENDENTE','EM_ANDAMENTO','FEITO','NAO_CONCLUIDA')),
  observations   text,
  unforeseen     text,
  is_backlog     boolean not null default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create table weekly_reports (
  id                    uuid primary key default uuid_generate_v4(),
  sprint_id             uuid not null references sprints(id) on delete cascade,
  report_date           date not null default current_date,
  general_observations  text,
  created_at            timestamptz default now()
);

-- ============================================================
-- ÍNDICES
-- ============================================================

create index idx_tasks_sprint_id  on tasks(sprint_id);
create index idx_tasks_developer  on tasks(developer);
create index idx_tasks_status     on tasks(status);
create index idx_tasks_is_backlog on tasks(is_backlog);
create index idx_reports_sprint   on weekly_reports(sprint_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Para time pequeno: todos leem e escrevem. Ajuste conforme necessário.
-- ============================================================

alter table sprints       enable row level security;
alter table tasks         enable row level security;
alter table weekly_reports enable row level security;

create policy "allow_all_sprints"        on sprints        for all using (true) with check (true);
create policy "allow_all_tasks"          on tasks          for all using (true) with check (true);
create policy "allow_all_weekly_reports" on weekly_reports for all using (true) with check (true);

-- ============================================================
-- DADOS INICIAIS — Sprints históricas da planilha
-- ============================================================

insert into sprints (name, start_date, end_date, status) values
  ('Sprint 30/03–10/04', '2026-03-30', '2026-04-10', 'ATIVA'),
  ('Sprint 16/03–27/03', '2026-03-16', '2026-03-27', 'ENCERRADA'),
  ('Sprint 02/03–13/03', '2026-03-02', '2026-03-13', 'ENCERRADA'),
  ('Sprint 19/02–27/02', '2026-02-19', '2026-02-27', 'ENCERRADA'),
  ('Sprint 02/02–13/02', '2026-02-02', '2026-02-13', 'ENCERRADA'),
  ('Sprint 19/01–30/01', '2026-01-19', '2026-01-30', 'ENCERRADA'),
  ('Sprint 05/01–16/01', '2026-01-05', '2026-01-16', 'ENCERRADA');

-- ============================================================
-- DADOS INICIAIS — Backlog geral (aba "Geral" da planilha)
-- ============================================================

insert into tasks (title, type, priority, module, status, is_backlog) values
  ('Melhorar função de login',                     'BUG',   'ALTA',  'Intranet',  'PENDENTE', true),
  ('Revisão e correção de arquivos da documentação na intranet', 'BUG', 'MEDIA', 'Intranet', 'FEITO', true),
  ('Correção da API da Datagro',                   'BUG',   'BAIXA', 'Intranet',  'FEITO',    true),
  ('Revisar lógica de criação de usuário',         'ATT',   'MEDIA', 'Intranet',  'PENDENTE', true),
  ('Layout',                                       'ATT',   'BAIXA', 'Intranet',  'PENDENTE', true),
  ('Definir eventos pelo calendário',              'ATT',   'BAIXA', 'Intranet',  'PENDENTE', true),
  ('Criação de LOGs de registro de acesso detalhado', 'NEW', 'MEDIA', 'Intranet', 'PENDENTE', true),
  ('Áreas dos módulos',                            'ATT',   'BAIXA', 'Intranet',  'PENDENTE', true),
  ('Criação de CRUDs para o sistema de 5s (Parte 1/2)', 'NEW', 'MEDIA', '5s',    'FEITO',    true),
  ('Criação de CRUDs para o sistema de 5s (Parte 2/2)', 'NEW', 'MEDIA', '5s',    'PENDENTE', true),
  ('Conexão do Frontend do 5s com os CRUDs do 5s (Parte 1/2)', 'NEW', 'MEDIA', '5s', 'FEITO', true),
  ('Conexão do Frontend do 5s com os CRUDs do 5s (Parte 2/2)', 'NEW', 'MEDIA', '5s', 'PENDENTE', true),
  ('Prototipação das telas do plano de ação',      'EXTRA', 'MEDIA', '5s',        'FEITO',    true),
  ('Criação da página de edição de areas',         'NEW',   'MEDIA', '5s',        'FEITO',    true),
  ('Criação da página de edição de notas',         'NEW',   'MEDIA', '5s',        'FEITO',    true),
  ('Tipos de checklists (expandir para mais checklists)', 'ATT', 'BAIXA', '5s',  'PENDENTE', true),
  ('Telas da auditoria',                           'BUG',   'ALTA',  'Auditoria', 'PENDENTE', true),
  ('Melhoria no filtro',                           'ATT',   'BAIXA', 'Auditoria', 'PENDENTE', true),
  ('Reunião com Dr. Felipe sobre telas e funcionalidades', 'EXTRA', 'MEDIA', 'Aprovação', 'PENDENTE', true),
  ('Levantamento de requisitos e prototipação para o APP', 'EXTRA', 'MEDIA', 'Aprovação', 'PENDENTE', true);

-- ============================================================
-- DADOS INICIAIS — Sprint ativa (30/03–10/04)
-- ============================================================

do $$
declare sprint_id uuid;
begin
  select id into sprint_id from sprints where start_date = '2026-03-30' limit 1;

  insert into tasks (sprint_id, title, type, classification, priority, module, developer, status, is_backlog) values
    (sprint_id, 'Função para impressão da listagem de colaboradores por UGB', 'NEW', 'FE', 'MEDIA', 'Intranet', 'Israel', 'FEITO', false),
    (sprint_id, 'Funcionalidades de CRUD no frontend apoiadores', 'NEW', 'FE', 'MEDIA', 'Intranet', 'Israel', 'FEITO', false),
    (sprint_id, 'Telas de CRUD dos apoiadores para administração', 'NEW', 'FE', 'MEDIA', 'Intranet', 'Israel', 'FEITO', false),
    (sprint_id, 'Rest de logs', 'NEW', 'BE', 'MEDIA', 'Intranet', 'Israel', 'FEITO', false),
    (sprint_id, 'Função e Tela de logs', 'NEW', 'FE', 'MEDIA', 'Intranet', 'Israel', 'FEITO', false),
    (sprint_id, 'Função de Crud de avaliação', 'NEW', 'FE', 'MEDIA', 'Avaliação', 'Israel', 'EM_ANDAMENTO', false),
    (sprint_id, 'Tela da av invertidas questão', 'NEW', 'FE', 'MEDIA', 'Avaliação', 'Israel', 'EM_ANDAMENTO', false),
    (sprint_id, 'Tela da av invertidas auto-av', 'NEW', 'FE', 'MEDIA', 'Avaliação', 'Israel', 'EM_ANDAMENTO', false),
    (sprint_id, 'Tela da av Pares', 'NEW', 'FE', 'MEDIA', 'Avaliação', 'Antonia', 'EM_ANDAMENTO', false),
    (sprint_id, 'Criação de módulos Documentação', 'NEW', 'SI', 'MEDIA', 'Documentação', 'Israel', 'FEITO', false),
    (sprint_id, 'Criação de módulos Certificação', 'NEW', 'SI', 'MEDIA', 'Certificação', 'Israel', 'FEITO', false),
    (sprint_id, 'Conversão dos dados de plano de ação para o padrão do sgm', 'EXTRA', 'BE', 'MEDIA', '5s', 'João Vitor', 'FEITO', false),
    (sprint_id, 'Melhoria na função de inserção de notas via planilha', 'ATT', 'BE', 'MEDIA', '5s', 'João Vitor', 'FEITO', false),
    (sprint_id, 'Melhoria e liberação de avaliação do auditor 5s', 'ATT', 'BE', 'MEDIA', '5s', 'João Vitor', 'FEITO', false),
    (sprint_id, 'Correção na busca de notas dos auditores 5s para fechamento de auditoria', 'BUG', 'BE', 'MEDIA', 'Auditoria', 'João Vitor', 'FEITO', false),
    (sprint_id, 'Rest de avaliação invertida', 'NEW', 'BE', 'MEDIA', 'Avaliação', 'João Vitor', 'EM_ANDAMENTO', false),
    (sprint_id, 'Rest de avaliação Auto-Avaliação', 'NEW', 'BE', 'MEDIA', 'Avaliação', 'João Vitor', 'PENDENTE', false),
    (sprint_id, 'Rest de avaliação pares', 'NEW', 'BE', 'MEDIA', 'Avaliação', 'João Vitor', 'PENDENTE', false);
end $$;

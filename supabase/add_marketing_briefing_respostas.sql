-- Respostas dos Briefings Estratégicos de Marketing (8 formulários por cargo,
-- ver src/lib/marketing-briefings/*.ts). O conteúdo/estrutura de cada formulário
-- vive no código; esta tabela só guarda as respostas.
--
-- Aplicar manualmente no SQL Editor do Supabase (projeto do comercial_nextjs,
-- lyisdsnocroocxfblvqf.supabase.co).

create table if not exists marketing_briefing_respostas (
  id                    uuid primary key default uuid_generate_v4(),
  formulario_id         text not null,         -- ex: 'diretor-pedagogico'
  nome                  text not null,
  funcao                text not null,
  tempo_atuacao         text,
  areas_participacao    jsonb,                 -- { [area]: nivel }
  prioridades_percebidas jsonb,                -- string[] em ordem de prioridade
  respostas             jsonb not null default '{}'::jsonb,  -- { [pergunta_id]: valor }
  created_by            uuid references profiles(id) on delete set null,
  created_at            timestamptz not null default now()
);

create index if not exists idx_marketing_briefing_formulario on marketing_briefing_respostas(formulario_id);
create index if not exists idx_marketing_briefing_created_by on marketing_briefing_respostas(created_by);

alter table marketing_briefing_respostas enable row level security;

-- Qualquer pessoa autenticada pode responder um briefing
drop policy if exists "Autenticados enviam briefing de marketing" on marketing_briefing_respostas;
create policy "Autenticados enviam briefing de marketing" on marketing_briefing_respostas
  for insert to authenticated
  with check (auth.uid() is not null);

-- Só gerentes veem as respostas (painel de marketing)
drop policy if exists "Gerente ve respostas de marketing" on marketing_briefing_respostas;
create policy "Gerente ve respostas de marketing" on marketing_briefing_respostas
  for select to authenticated
  using (
    (select role from profiles where id = auth.uid()) = 'gerente'
  );

select 'Tabela marketing_briefing_respostas criada ✅' as resultado;

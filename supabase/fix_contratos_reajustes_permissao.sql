-- Permite que consultoras (Raissa, Isa) editem a tabela de reajustes. Rodar no SQL Editor do Supabase.
drop policy if exists "contratos_reajustes: escrever" on contratos_reajustes;
create policy "contratos_reajustes: escrever" on contratos_reajustes for all using (can_view_all()) with check (can_view_all());

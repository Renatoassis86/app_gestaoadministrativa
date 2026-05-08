-- ============================================================
-- Constraint única para evitar duplicatas na importação
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Índice único: email + fonte (quando email existe)
-- Permite upsert sem duplicar o mesmo lead da mesma fonte
create unique index if not exists idx_leads_universal_email_fonte
  on leads_universal(lower(email), fonte)
  where email is not null and email != '';

-- Para registros sem email: nome + escola_nome + fonte
create unique index if not exists idx_leads_universal_nome_escola_fonte
  on leads_universal(lower(nome), lower(escola_nome), fonte)
  where (email is null or email = '')
    and nome is not null and nome != ''
    and escola_nome is not null and escola_nome != '';

select 'Constraints de deduplicação criadas ✅' as resultado;

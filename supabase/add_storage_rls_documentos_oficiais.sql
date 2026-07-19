-- Corrige uploads/downloads/exclusões quebrados no bucket "documentos-oficiais"
-- (usado por Transcrições e Contratos).
--
-- Diagnóstico: nenhuma política de RLS existia para storage.objects neste bucket.
-- Como o Storage do Supabase tem RLS habilitado por padrão, TODO upload feito por
-- um usuário autenticado (via createClient() no navegador) era bloqueado com
-- "new row violates row-level security policy" — confirmado testando com um
-- usuário logado real, não só com a chave de serviço (que ignora RLS e por isso
-- não pegava esse problema nos testes anteriores).
--
-- O código salvava o caminho do arquivo no banco mesmo quando o upload falhava
-- (bug já corrigido em TranscricaoForm.tsx), então o arquivo nunca existia de
-- fato no storage — daí o erro 404 "Object not found" ao tentar baixar.
--
-- Aplicar manualmente no SQL Editor do Supabase (projeto do comercial_nextjs,
-- lyisdsnocroocxfblvqf.supabase.co).

drop policy if exists "Autenticados podem enviar documentos-oficiais" on storage.objects;
create policy "Autenticados podem enviar documentos-oficiais"
on storage.objects for insert
to authenticated
with check (bucket_id = 'documentos-oficiais');

drop policy if exists "Autenticados podem atualizar documentos-oficiais" on storage.objects;
create policy "Autenticados podem atualizar documentos-oficiais"
on storage.objects for update
to authenticated
using (bucket_id = 'documentos-oficiais')
with check (bucket_id = 'documentos-oficiais');

drop policy if exists "Autenticados podem excluir documentos-oficiais" on storage.objects;
create policy "Autenticados podem excluir documentos-oficiais"
on storage.objects for delete
to authenticated
using (bucket_id = 'documentos-oficiais');

drop policy if exists "Autenticados podem listar documentos-oficiais" on storage.objects;
create policy "Autenticados podem listar documentos-oficiais"
on storage.objects for select
to authenticated
using (bucket_id = 'documentos-oficiais');

select 'Políticas de storage para documentos-oficiais criadas ✅' as resultado;

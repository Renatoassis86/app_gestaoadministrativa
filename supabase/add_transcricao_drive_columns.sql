-- Adiciona colunas para o arquivo de transcrição hospedado no Google Drive
-- (a mídia/gravação continua nas colunas arquivo_midia_* existentes, sem
-- alteração — decisão de onde hospedar gravações fica para depois).
--
-- Aplicar manualmente no SQL Editor do Supabase (projeto do comercial_nextjs,
-- lyisdsnocroocxfblvqf.supabase.co).

alter table transcricoes_reunioes add column if not exists arquivo_transcricao_drive_id  text;
alter table transcricoes_reunioes add column if not exists arquivo_transcricao_drive_url text;

select 'Colunas de Drive adicionadas a transcricoes_reunioes ✅' as resultado;

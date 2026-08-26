-- Migration: update_bilinguismo_novos_campos.sql
-- Adiciona novos campos para formulário e contrato de Bilinguismo

ALTER TABLE public.formularios_bilinguismo
  ADD COLUMN IF NOT EXISTS nome_fantasia TEXT,
  ADD COLUMN IF NOT EXISTS vencimento_primeira_parcela DATE,
  ADD COLUMN IF NOT EXISTS numero_parcelas INTEGER DEFAULT 12;

ALTER TABLE public.contratos_bilinguismo
  ADD COLUMN IF NOT EXISTS nome_fantasia TEXT,
  ADD COLUMN IF NOT EXISTS vencimento_primeira_parcela DATE,
  ADD COLUMN IF NOT EXISTS numero_parcelas INTEGER DEFAULT 12;

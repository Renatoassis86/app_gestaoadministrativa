-- Migration: add_representante_legal_bilinguismo.sql
-- Adiciona campos cadastrais completos do Representante Legal na tabela formularios_bilinguismo

ALTER TABLE public.formularios_bilinguismo
  ADD COLUMN IF NOT EXISTS legal_cpf TEXT,
  ADD COLUMN IF NOT EXISTS legal_rg TEXT,
  ADD COLUMN IF NOT EXISTS legal_orgao TEXT,
  ADD COLUMN IF NOT EXISTS legal_email TEXT,
  ADD COLUMN IF NOT EXISTS legal_celular TEXT,
  ADD COLUMN IF NOT EXISTS legal_cargo TEXT,
  ADD COLUMN IF NOT EXISTS legal_rua TEXT,
  ADD COLUMN IF NOT EXISTS legal_numero TEXT,
  ADD COLUMN IF NOT EXISTS legal_complemento TEXT,
  ADD COLUMN IF NOT EXISTS legal_bairro TEXT,
  ADD COLUMN IF NOT EXISTS legal_cidade TEXT,
  ADD COLUMN IF NOT EXISTS legal_estado TEXT,
  ADD COLUMN IF NOT EXISTS legal_cep TEXT;

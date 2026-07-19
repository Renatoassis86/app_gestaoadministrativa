-- Migration: add_bilinguismo.sql
-- Adiciona tabelas e politicas RLS para o modulo de Bilinguismo / Parceria de Ingles

-- 1. Tabela de Formularios / Propostas do Bilinguismo
CREATE TABLE IF NOT EXISTS public.formularios_bilinguismo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  email_responsavel TEXT NOT NULL,

  nome_escola TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  rua TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,

  nome_representante_legal TEXT NOT NULL,

  pacote_interesse TEXT NOT NULL CHECK (pacote_interesse IN ('bronze', 'silver', 'gold')),

  escola_id UUID REFERENCES public.escolas(id) ON DELETE SET NULL
);

-- 2. Tabela de Contratos do Bilinguismo
CREATE TABLE IF NOT EXISTS public.contratos_bilinguismo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID REFERENCES public.escolas(id) ON DELETE CASCADE,
  formulario_bilinguismo_id UUID REFERENCES public.formularios_bilinguismo(id) ON DELETE SET NULL,

  -- Checklist de progresso contratual
  formulario_enviado BOOLEAN DEFAULT FALSE,
  formulario_recebido BOOLEAN DEFAULT FALSE,
  minuta_enviada BOOLEAN DEFAULT FALSE,
  retorno_minuta BOOLEAN DEFAULT FALSE,
  minuta_atualizada BOOLEAN DEFAULT FALSE,
  contrato_enviado BOOLEAN DEFAULT FALSE,
  contrato_assinado BOOLEAN DEFAULT FALSE,
  contrato_arquivado BOOLEAN DEFAULT FALSE,

  observacao_minuta TEXT,
  encaminhamento_final TEXT,
  tempo_contrato INTEGER DEFAULT 12, -- em meses

  pacote_contratado TEXT CHECK (pacote_contratado IN ('bronze', 'silver', 'gold')),
  valor_anual NUMERIC(12, 2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices para otimizacao de busca
CREATE INDEX IF NOT EXISTS idx_formularios_bilinguismo_escola ON public.formularios_bilinguismo(escola_id);
CREATE INDEX IF NOT EXISTS idx_contratos_bilinguismo_escola ON public.contratos_bilinguismo(escola_id);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.formularios_bilinguismo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos_bilinguismo ENABLE ROW LEVEL SECURITY;

-- 4. Politicas RLS para formularios_bilinguismo
-- Permite insercao publica (anon e authenticated) para o formulario publico
DROP POLICY IF EXISTS "Permitir insercao publica em formularios_bilinguismo" ON public.formularios_bilinguismo;
CREATE POLICY "Permitir insercao publica em formularios_bilinguismo"
  ON public.formularios_bilinguismo
  FOR INSERT
  WITH CHECK (true);

-- Permite leitura e gestao total para usuarios autenticados
DROP POLICY IF EXISTS "Permitir leitura autenticada em formularios_bilinguismo" ON public.formularios_bilinguismo;
CREATE POLICY "Permitir leitura autenticada em formularios_bilinguismo"
  ON public.formularios_bilinguismo
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Permitir update autenticado em formularios_bilinguismo" ON public.formularios_bilinguismo;
CREATE POLICY "Permitir update autenticado em formularios_bilinguismo"
  ON public.formularios_bilinguismo
  FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Permitir delete autenticado em formularios_bilinguismo" ON public.formularios_bilinguismo;
CREATE POLICY "Permitir delete autenticado em formularios_bilinguismo"
  ON public.formularios_bilinguismo
  FOR DELETE
  TO authenticated
  USING (true);

-- 5. Politicas RLS para contratos_bilinguismo
DROP POLICY IF EXISTS "Permitir acesso completo autenticado em contratos_bilinguismo" ON public.contratos_bilinguismo;
CREATE POLICY "Permitir acesso completo autenticado em contratos_bilinguismo"
  ON public.contratos_bilinguismo
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

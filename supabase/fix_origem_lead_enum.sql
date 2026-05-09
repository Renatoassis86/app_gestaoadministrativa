-- ============================================================
-- Adicionar valores faltantes ao enum origem_lead
-- Execute no SQL Editor do Supabase
-- ============================================================

ALTER TYPE origem_lead ADD VALUE IF NOT EXISTS 'indicacao_escola';
ALTER TYPE origem_lead ADD VALUE IF NOT EXISTS 'abeka';
ALTER TYPE origem_lead ADD VALUE IF NOT EXISTS 'acsi';
ALTER TYPE origem_lead ADD VALUE IF NOT EXISTS 'congresso_ecc';
ALTER TYPE origem_lead ADD VALUE IF NOT EXISTS 'envio_material';
ALTER TYPE origem_lead ADD VALUE IF NOT EXISTS 'opening_company';

SELECT 'Enum origem_lead atualizado ✅' AS resultado;

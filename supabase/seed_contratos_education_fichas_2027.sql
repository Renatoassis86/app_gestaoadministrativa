-- ============================================================
-- Carga inicial: 4 fichas de coleta de dados (ciclo 2027)
-- Fonte: Desktop\Education\Contratos Education\Ficha de Coleta de dados - *.xlsx
-- Rodar DEPOIS de add_modulo_contratos_education.sql. Idempotente.
--
-- Escolas usadas (já existem no CRM — nada é duplicado):
--   Pleroma  -> 4f445de1-...  (CNPJ 66.408.321/0001-38; existe outra "Colégio Cristão Pleroma" com CNPJ 39.304... — NÃO usada)
--   Penha    -> 28030ec3-...  "Colégio Presbiteriano da Penha" (sem CNPJ no cadastro; "Colégio Cristão da Penha" é outra escola)
--   Verum    -> 212d761e-...  (a que já tem contrato no sistema; há mais 4 cadastros duplicados do Verum)
--   Carey    -> 0f0df81b-...  "Colégio William Carey" (existe duplicata "Caio baez" com o mesmo CNPJ — NÃO usada)
--
-- Ajustes na transcrição (conferir com as escolas):
--  * William Carey: CPF veio como número 1298350131 (Excel cortou o zero) -> 01298350131.
--  * Penha: CEP do representante "0218-020" tem 7 dígitos -> deixado em branco (endereço no texto).
--  * Verum: valor total da ficha (98.600) NÃO bate com as séries (101.600). Mantido o da ficha.
--  * Boleto: ficha diz 4 parcelas/dezembro; a cláusula 10.6 do modelo diz 1ª parcela 10/12/2026 + 4 (=5). Gravado 4.
--  * status 'rascunho' e veterana=false: a ficha não informa.
-- ============================================================

-- ---------- escolas: completa qualificação ----------
update escolas set razao_social='ASSOCIACAO EDUCACIONAL PLEROMA', rua='Antônio Lagrota', numero='125',
  bairro='Mariano Procópio', cidade='Juiz de Fora', estado='MG', cep='36035020'
 where id='4f445de1-38bf-4786-bcf0-6b1937e63dbf';

update escolas set razao_social='COLEGIO PRESBITERIANO DA PENHA LTDA', nome_fantasia='COLEGIO PRESBITERIANO DA PENHA',
  cnpj='68.754.150/0001-24', rua='Rua Conceição Pereira', numero='315', bairro='Penha da França',
  cidade='São Paulo', estado='SP', cep='03642040'
 where id='28030ec3-dca6-43db-8816-f115dc3eadba';

update escolas set razao_social='VERUM ESCOLA CRISTA CLASSICA LTDA', nome_fantasia='VERUM ESCOLA CRISTA CLASSICA',
  rua='Rua Luis Teixeira Freire', numero='765', bairro='São Francisco', cidade='Guanambi', estado='BA', cep='46430000'
 where id='212d761e-e073-4775-b0db-631a113fdc42';

update escolas set razao_social='COLEGIO WILLIAM CAREY', nome_fantasia='CWC',
  rua='R. Estevão Leão Bourroul', numero='2069', bairro='Centro', cidade='Franca', estado='SP', cep='14400750'
 where id='0f0df81b-9aa3-4681-a576-64aa89a2b2cd';

-- ---------- contratos (1 por escola; atualiza o existente do Verum) ----------
insert into contratos (escola_id) values
 ('4f445de1-38bf-4786-bcf0-6b1937e63dbf'),
 ('28030ec3-dca6-43db-8816-f115dc3eadba'),
 ('0f0df81b-9aa3-4681-a576-64aa89a2b2cd')
on conflict (escola_id) do nothing;

update contratos set modalidade='boleto', ano_letivo_inicial=2027, ano_letivo_final=2030,
  legal_nome='William Hudson Medeiros Tostes', legal_cpf='09231067664', legal_rg='15957769',
  legal_email='williamhudson777@gmail.com', legal_telefone='32999369331', legal_cep='36031480',
  legal_endereco_texto='Raul Correa Castro, 310, Ipiranga - Juiz de Fora/MG',
  pedagogico_nome='Ingrid Amorim Beligoli Aguiar', pedagogico_email='ingridamorimbeligoli@gmail.com', pedagogico_telefone='21969541490',
  financeiro_nome='Luan Zatta Felício', financeiro_email='luanzatta90@gmail.com', financeiro_telefone='32988633196',
  letivo_inicio='2027-01-31', formato_calendario='bimestral', qtd_alunos_estimado=48,
  valor_total=55200, forma_pagamento='boleto', num_parcelas=4, valor_parcela=13800, primeiro_vencimento_texto='dezembro'
 where escola_id='4f445de1-38bf-4786-bcf0-6b1937e63dbf';

update contratos set modalidade='boleto', ano_letivo_inicial=2027, ano_letivo_final=2030,
  legal_nome='DANIELA APARECIDA DE FRANÇA SANTOS', legal_cpf='30443839867', legal_rg='402548164',
  legal_email='dani.fsantos@icloud.com', legal_telefone='11982640059',
  legal_endereco_texto='Rua Soldado José Viente de Paula, 201, ap 112, Parque Novo Mundo - São Paulo/SP (CEP informado "0218-020" está incompleto)',
  pedagogico_nome='Jéssica Wingerter Teixeira Coelho', pedagogico_email='colegiopresbiterianodapenha@gmail.com', pedagogico_telefone='11971127804',
  financeiro_nome='Daniela Aparecida de França Santos', financeiro_email='dani.fsantos@icloud.com', financeiro_telefone='11982640059',
  letivo_inicio='2027-02-01', letivo_fim='2027-12-31', formato_calendario='bimestral', qtd_alunos_estimado=126,
  valor_total=171900, forma_pagamento='boleto', num_parcelas=4, valor_parcela=42975, primeiro_vencimento_texto='dezembro'
 where escola_id='28030ec3-dca6-43db-8816-f115dc3eadba';

update contratos set modalidade='boleto', ano_letivo_inicial=2027, ano_letivo_final=2030,
  legal_nome='Jemima Sarmento Cruz Guimarães Rodrigues', legal_cpf='98806882520', legal_rg='0678230170',
  legal_email='diretoria@escolaverum.com.br', legal_telefone='71991683010', legal_cep='46430000',
  legal_endereco_texto='Av. Deolinda Martins, 1106, Santo Antônio - Guanambi/BA',
  pedagogico_nome='Osvaldo Veloso Vidal', pedagogico_email='contato@escolaverum.com.br', pedagogico_telefone='77988140800',
  financeiro_nome='Katia Leila Lima Silva Vidal', financeiro_email='financeiro@escolaverum.com.br', financeiro_telefone='77991171636',
  formato_calendario='bimestral', qtd_alunos_estimado=80,
  valor_total=98600, forma_pagamento='boleto', num_parcelas=4, valor_parcela=24650, primeiro_vencimento_texto='dezembro',
  observacoes='ATENÇÃO: valor total da ficha (R$ 98.600) difere do cálculo por série (R$ 101.600). Ficha não informa datas do ano letivo.'
 where escola_id='212d761e-e073-4775-b0db-631a113fdc42';

update contratos set modalidade='eskolare', ano_letivo_inicial=2027, ano_letivo_final=2030,
  legal_nome='Caio Sérgio Alves Baez', legal_cpf='01298350131', legal_rg='1232722',
  legal_email='diretoria@colegiowilliamcarey.com.br', legal_telefone='16991688172', legal_cep='14401295',
  legal_endereco_texto='Rua Estêvão Leão Bourroul, 200 - Apartamento 121, Centro, Franca/SP',
  pedagogico_nome='Karla Stropa Goulart', pedagogico_email='coordenacao@colegiowilliamcarey.com.br', pedagogico_telefone='16991540028',
  financeiro_nome='Júlia Gonçalves Lemes', financeiro_email='finaceiro@colegiowilliamcarey.com', financeiro_telefone='16991613162',
  letivo_inicio='2027-01-26', letivo_fim='2027-12-16', formato_calendario='trimestral', qtd_alunos_estimado=225,
  valor_total=258750, forma_pagamento='pix_cartao_loja_virtual', parcelas_max_cartao=10, primeiro_vencimento_texto='dezembro',
  observacoes='E-mail financeiro veio como "finaceiro@...com" (provável erro de digitação). Repasse à escola (fixo/variável) ainda não definido.'
 where escola_id='0f0df81b-9aa3-4681-a576-64aa89a2b2cd';

-- ---------- contratos_series (ano letivo 2027, kit completo) ----------
insert into contratos_series (contrato_id, ano_letivo, serie, tipo_kit, curriculo, quantidade, valor_unitario)
select c.id, 2027, s.serie, 'completo', s.curriculo, s.qtd, s.preco
from (values
 ('4f445de1-38bf-4786-bcf0-6b1937e63dbf','infantil2','Paideia Infantil',12,1150.00),
 ('4f445de1-38bf-4786-bcf0-6b1937e63dbf','infantil3','Paideia Infantil',12,1150.00),
 ('4f445de1-38bf-4786-bcf0-6b1937e63dbf','infantil4','Paideia Infantil',12,1150.00),
 ('4f445de1-38bf-4786-bcf0-6b1937e63dbf','infantil5','Paideia Infantil',12,1150.00),

 ('28030ec3-dca6-43db-8816-f115dc3eadba','infantil4','Paideia Infantil',18,1150.00),
 ('28030ec3-dca6-43db-8816-f115dc3eadba','infantil5','Paideia Infantil',18,1150.00),
 ('28030ec3-dca6-43db-8816-f115dc3eadba','fund1_ano1','Paideia Fundamental',18,1450.00),
 ('28030ec3-dca6-43db-8816-f115dc3eadba','fund1_ano2','Paideia Fundamental',18,1450.00),
 ('28030ec3-dca6-43db-8816-f115dc3eadba','fund1_ano3','Paideia Fundamental',18,1450.00),
 ('28030ec3-dca6-43db-8816-f115dc3eadba','fund1_ano4','Paideia Fundamental',18,1450.00),
 ('28030ec3-dca6-43db-8816-f115dc3eadba','fund1_ano5','Paideia Fundamental',18,1450.00),

 ('212d761e-e073-4775-b0db-631a113fdc42','infantil3','Paideia Infantil',16,1150.00),
 ('212d761e-e073-4775-b0db-631a113fdc42','infantil4','Paideia Infantil',16,1150.00),
 ('212d761e-e073-4775-b0db-631a113fdc42','infantil5','Paideia Infantil',16,1150.00),
 ('212d761e-e073-4775-b0db-631a113fdc42','fund1_ano1','Paideia Fundamental',16,1450.00),
 ('212d761e-e073-4775-b0db-631a113fdc42','fund1_ano2','Paideia Fundamental',16,1450.00),

 ('0f0df81b-9aa3-4681-a576-64aa89a2b2cd','infantil2','Paideia Infantil',15,850.00),
 ('0f0df81b-9aa3-4681-a576-64aa89a2b2cd','infantil3','Paideia Infantil',15,850.00),
 ('0f0df81b-9aa3-4681-a576-64aa89a2b2cd','infantil4','Paideia Infantil',25,850.00),
 ('0f0df81b-9aa3-4681-a576-64aa89a2b2cd','infantil5','Paideia Infantil',35,850.00),
 ('0f0df81b-9aa3-4681-a576-64aa89a2b2cd','fund1_ano1','Paideia Fundamental',40,1350.00),
 ('0f0df81b-9aa3-4681-a576-64aa89a2b2cd','fund1_ano2','Paideia Fundamental',15,1350.00),
 ('0f0df81b-9aa3-4681-a576-64aa89a2b2cd','fund1_ano3','Paideia Fundamental',30,1350.00),
 ('0f0df81b-9aa3-4681-a576-64aa89a2b2cd','fund1_ano4','Paideia Fundamental',25,1350.00),
 ('0f0df81b-9aa3-4681-a576-64aa89a2b2cd','fund1_ano5','Paideia Fundamental',25,1350.00)
) as s(escola_id, serie, curriculo, qtd, preco)
join contratos c on c.escola_id = s.escola_id::uuid
on conflict (contrato_id, ano_letivo, serie, tipo_kit) do update set
  quantidade = excluded.quantidade, valor_unitario = excluded.valor_unitario;

-- Conferência: o Verum deve mostrar 98.600 informado x 101.600 calculado
select e.nome, r.modalidade, r.kits_ano1, r.valor_calculado_ano1, r.valor_informado_ano1
from contratos_resumo r join escolas e on e.id = r.escola_id
where r.modalidade is not null order by e.nome;

-- Liga cada escola da tabela de reajustes ao cadastro (CRM), para o cartão da escola receber os contratos.
alter table contratos_reajustes add column if not exists escola_id uuid references escolas(id) on delete set null;

-- Vínculos seguros (nome único e claro no CRM). As demais escolas se vinculam pelo próprio cartão.
update contratos_reajustes r set escola_id = e.id from escolas e where r.escola_id is null and (
     (r.escola = 'ROSA DE SARON'          and e.id::text like '49a966ee%')
  or (r.escola = 'CRISTÃ SUDOESTE'        and e.id::text like '3d20c5a7%')
  or (r.escola like 'ACBV%'               and e.id::text like 'c45c24da%')
  or (r.escola = 'TRINUM'                 and e.id::text like 'b98c6544%')
  or (r.escola = 'FAROL'                  and e.id::text like 'bb96694e%')
  or (r.escola = 'BATISTA FLUMINENSE'     and e.id::text like '4361450a%')
  or (r.escola = 'IMAGO DEI'              and e.id::text like '0c18fb25%')
  or (r.escola = 'LUMINI DEO'             and e.id::text like '01ac4ca8%')
  or (r.escola = 'REVERENDO OLAVO NUNES'  and e.id::text like 'dc2eb6ee%')
  or (r.escola = 'LOGOS DE INDAIATUBA'    and e.id::text like 'a6064879%')
  or (r.escola = 'ALFA 2'                 and e.id::text like '055d7726%')
  or (r.escola = 'GAUSS'                  and e.id::text like '0a2adca8%')
  or (r.escola = 'MOREH CHRISTIAN CENTER' and e.id::text like '52e43279%')
  or (r.escola = 'LAMAD'                  and e.id::text like 'be732a08%')
);

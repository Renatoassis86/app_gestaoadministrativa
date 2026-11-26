-- Reajustes 2027 + novas adesões (módulo Contratos). Seguro para rodar mais de uma vez.
create table if not exists contratos_reajustes (
  id                    uuid primary key default gen_random_uuid(),
  ordem                 int  not null default 0,
  categoria             text,          -- nova | veterana
  modelo                text,          -- Boleto | Eskolare
  inf2                  int, inf3 int, inf4 int, inf5 int,
  escola                text not null,
  valor_kit             text,
  reaj_infantil         text,
  reaj_1ano             text,
  reaj_incompleto       text,
  valor_contrato        text,
  valor_parcela         text,
  vencimento            text,
  adesao_1ano           text, adesao_2ano text, adesao_3ano text, adesao_4ano text, adesao_5ano text,
  parcelamentos         text,
  data_primeira_parcela text,
  email_aditivo         text,
  aditivo_enviado       text,
  observacoes           text,
  updated_at            timestamptz not null default now()
);
alter table contratos_reajustes enable row level security;
drop policy if exists "contratos_reajustes: ler" on contratos_reajustes;
drop policy if exists "contratos_reajustes: escrever" on contratos_reajustes;
create policy "contratos_reajustes: ler"      on contratos_reajustes for select using (can_view_all());
create policy "contratos_reajustes: escrever" on contratos_reajustes for all using (can_view_all()) with check (can_view_all());   -- Raissa e Isa (consultoras) também editam

-- Carga inicial (só se a tabela estiver vazia)
do $$ begin if not exists (select 1 from contratos_reajustes) then
insert into contratos_reajustes (categoria,modelo,inf2,inf3,inf4,inf5,escola,valor_kit,reaj_infantil,reaj_1ano,reaj_incompleto,valor_contrato,valor_parcela,vencimento,adesao_1ano,adesao_2ano,adesao_3ano,adesao_4ano,adesao_5ano,parcelamentos,data_primeira_parcela,email_aditivo,aditivo_enviado,ordem) values
('nova','Boleto',11,13,0,0,'CULTURA CRISTÃ','R$ 1.000,00','R$ 1.044,40',null,null,null,null,'10/12/2025','-','-','-','-','-','4x','10/12/2026',null,null,1),
('nova','Boleto',10,10,10,10,'ALFA 2','R$ 1.000,00','R$ 1.044,40',null,null,null,null,'10/12/2025','-','-','-','-','-','4x','10/12/2026',null,null,2),
('nova','Boleto',9,15,29,26,'ROSA DE SARON','R$ 1.000,00','R$ 1.044,40','R$ 1.044,40',null,null,null,'10/12/2025',null,'-','-','-','-','Eskolare','Eskolare',null,null,3),
('nova','Boleto',0,0,12,12,'IMAGO DEI','R$ 1.000,00','R$ 1.044,40',null,null,null,null,'10/12/2025','R$ 1.450,00','R$ 1.450,00','R$ 1.450,00','R$ 1.450,00','R$ 1.450,00','4x','10/12/2026',null,null,4),
('nova','Boleto',8,6,0,0,'LUMINI DEO','R$ 1.000,00','R$ 1.044,40',null,null,null,null,'10/01/2026','R$ 1.450,00','R$ 1.450,00',null,null,null,'10x','15/01/2026',null,null,5),
('nova','Boleto',11,16,17,20,'REVERENDO OLAVO NUNES','R$ 1.000,00','R$ 1.044,40',null,null,null,null,'10/01/2026','R$ 1.450,00','-','-','-','-','10x','10/01/2026','olavonunesneto@gmail.com','sim',6),
('nova','Boleto',0,8,15,10,'LOGOS DE INDAIATUBA','R$ 1.000,00','R$ 1.044,40',null,null,null,null,'10/01/2026','R$ 1.450,00','R$ 1.450,00','R$ 1.450,00','-','-','4x','10/01/2026',null,null,7),
('nova','Eskolare',0,14,13,9,'CRISTÃ SUDOESTE','R$ 1.000,00','R$ 1.044,40','R$ 1.044,40',null,'Eskolare','Eskolare','Eskolare',null,'R$ 1.450,00','-','-','-','Eskolare','Eskolare',null,null,8),
('nova','Eskolare',24,35,38,42,'ACBV - Academia Cristã de Boa Vista','R$ 1.000,00','R$ 1.042,20',null,null,'Eskolare','Eskolare','Eskolare','-','-','-','-','-','Eskolare','Eskolare',null,null,9),
('nova','Eskolare',30,42,45,45,'TRINUM','R$ 900,00','R$ 939,96','R$ 939,96',null,'Eskolare','Eskolare','Eskolare',null,'R$ 1.200,00','-','-','-','Eskolare','Eskolare',null,null,10),
('nova','Eskolare',7,10,15,20,'IBEC','R$ 799,00','R$ 834,48',null,null,'Eskolare','Eskolare','Eskolare','-','-','-','-','-','Eskolare','Eskolare',null,null,11),
('nova','Eskolare',0,20,20,20,'INSTITUTO EDUCACIONAL EXCELÊNCIA','R$ 800,00','R$ 835,52','R$ 835,52',null,'Eskolare','Eskolare','Eskolare',null,'R$ 1.300,00','R$ 1.300,00','R$ 1.300,00','R$ 1.300,00','Eskolare','Eskolare',null,null,12),
('nova','Boleto',10,10,10,0,'MOREH CHRISTIAN CENTER','R$ 1.000,00','R$ 1.044,40',null,null,null,null,'25/01/2026','-','-','-','-','-','6x','25/01**',null,null,13),
('nova','Boleto',0,22,20,20,'LIRIO DOS VALES','R$ 1.000,00','R$ 1.044,40',null,null,null,null,null,'-','-','-','-','-','4x','10/02/2026','escolalirio2@hotmail.com','sim',14),
('veterana','Boleto',12,14,14,14,'CORAM DEO','R$ 900,00','R$ 939,96',null,null,null,null,'10/01/2026','R$ 1.200,00','-','-','-','-','8x **','10/01/2026','alencarpatricia83@gmail.com',null,15),
('veterana','Eskolare',11,18,15,7,'FAROL','R$ 1.000,00','R$ 1.044,40','R$ 1.044,40',null,'Eskolare','Eskolare','Eskolare',null,'R$ 1.450,00','-','-','-','Eskolare','Eskolare','direcao@institutocristaofarol.com.br',null,16),
('veterana','Eskolare',56,56,40,40,'ZOE','R$ 700,00','R$ 731,08',null,null,'Eskolare','Eskolare','Eskolare','R$ 1.150,00','-','-','-','-','Eskolare','Eskolare','matheusmacedo49@gmail.com',null,17),
('veterana','Eskolare',15,35,45,50,'BATISTA FLUMINENSE','R$ 1.000,00','R$ 1.044,40',null,null,'Eskolare','Eskolare','Eskolare','-','-','-','-','-','Eskolare','Eskolare','ramonpinto@cbflu.com.br',null,18),
('veterana','Boleto',7,11,12,12,'LUZ','R$ 1.000,00','R$ 1.044,40',null,'R$ 365,54','R$ 14.900,00',null,'10/01/2026','-','-','-','-','-','5x','10/01/2026','rodrigopasquetti@gmail.com',null,19),
('veterana','Boleto',12,20,20,12,'LAMAD','R$ 1.000,00','R$ 1.044,40',null,'R$ 887,74','R$ 56.200,00',null,'10/01/2026','R$ 1.450,00','-','-','-','-','8x','15/01/2026','escolalamad@gmail.com',null,20),
('veterana','Boleto',6,11,7,12,'FLORESCER','R$ 1.000,00','R$ 1.044,40','R$ 1.044,40',null,null,null,'15/01/2026',null,'R$ 1.450,00','R$ 1.450,00','R$ 1.450,00','R$ 1.450,00','12x','15/01/2026','priscilahassferreira@gmail.com',null,21),
('veterana','Boleto',30,50,50,55,'GAUSS','R$ 1.000,00','R$ 1.044,40','R$ 1.044,40',null,null,null,'15/01/2026',null,'R$ 1.150,00','R$ 1.150,00','R$ 1.150,00','R$ 1.150,00','12x','10/01/2026','sheilaaguiar0102@gmail.com',null,22),
('veterana','Boleto',30,38,54,50,'CIDADE VIVA ACADEMY','R$ 1.000,00','R$ 1.044,40','R$ 1.044,40',null,null,null,'15/01/2026',null,'R$ 1.450,00','R$ 1.450,00','R$ 1.450,00','R$ 1.450,00','12x','10/01/2026','patricia@cidadeviva.org',null,23);
end if; end $$;

-- perfil_pedagogico não tem fonte confiável de dado para a maioria das escolas:
-- o valor 'convencional' vinha do DEFAULT da coluna, não de uma resposta real
-- (nem no Excel da pesquisa CIECC, nem no banco de leads há pergunta sobre
-- linha pedagógica — a pergunta do CIECC é sobre confessionalidade cristã,
-- um eixo diferente). Torna a coluna opcional para permitir "sem informação".
alter table escolas alter column perfil_pedagogico drop default;
alter table escolas alter column perfil_pedagogico drop not null;

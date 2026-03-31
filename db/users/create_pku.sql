create user pku identified by pku
  default tablespace users
  temporary tablespace TEMP
  profile DEFAULT;

alter user pku quota unlimited on users;

grant create session to pku;
grant create table to pku;
grant create type to pku;
grant create sequence to pku;
grant create synonym to pku;
grant create procedure to pku;
grant create view to pku;


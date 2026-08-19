alter table "rivales" add column categoria text;

update "rivales" set categoria = 'Serie E' where categoria is null;

alter table "rivales" alter column categoria set not null;
-- Asistencia Biométrica · esquema PostgreSQL (Neon)
-- Ejecutar en Neon: SQL Editor → pegar → Run.

create table if not exists asignatura (
  id     text primary key,
  nombre text not null,
  aula   text
);

create table if not exists estudiante (
  id                   bigint generated always as identity primary key,
  codigo               text not null unique,
  nombre               text not null,
  plantilla_id         text,                       -- referencia a la plantilla guardada en el lector (no se guarda imagen)
  consentimiento_fecha timestamptz not null default now(),  -- Ley 1581 de 2012 / Decreto 1377 de 2013
  creado               timestamptz not null default now()
);

create table if not exists sesion (
  id            bigint generated always as identity primary key,
  asignatura_id text not null references asignatura(id) on delete cascade,
  fecha         date not null,
  unique (asignatura_id, fecha)
);

create table if not exists marcaje (
  id            bigint generated always as identity primary key,
  sesion_id     bigint not null references sesion(id) on delete cascade,
  estudiante_id bigint not null references estudiante(id) on delete cascade,
  hora          timestamptz not null default now(),
  score         int,
  unique (sesion_id, estudiante_id)               -- evita marcajes duplicados
);

create table if not exists intento_rechazado (
  id            bigint generated always as identity primary key,
  asignatura_id text references asignatura(id) on delete cascade,
  hora          timestamptz not null default now(),
  score         int
);

insert into asignatura (id, nombre, aula) values
  ('pw','Programación Web','Aula 204'),
  ('bd','Bases de Datos','Aula 301'),
  ('se','Sistemas Embebidos','Lab. Electrónica'),
  ('is','Ingeniería de Software','Aula 118')
on conflict (id) do nothing;

-- Nota de seguridad: la página accede a estos datos mediante la función de Netlify
-- (netlify/functions/api.js), que guarda la cadena de conexión en secreto.
-- La función no pide inicio de sesión, así que cualquiera con el enlace de la página puede
-- ver y registrar datos. Úsalo con datos ficticios; antes de cargar estudiantes reales, agrega
-- autenticación (por ejemplo Neon Auth o una contraseña de docente en la función).

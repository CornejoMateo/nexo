create table public.suppliers (
  id bigserial not null,
  name text not null,
  cuit text null,
  phone text null,
  email text null,
  address text null,
  notes text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint suppliers_pkey primary key (id),
  constraint suppliers_cuit_key unique (cuit)
) TABLESPACE pg_default;

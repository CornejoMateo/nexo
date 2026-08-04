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

CREATE POLICY "suppliers delete"
ON public.suppliers
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.uid_user = auth.uid()
          AND u.role = 'Admin'
    )
);

CREATE POLICY "suppliers insert"
ON public.suppliers
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.uid_user = auth.uid()
          AND u.role = 'Admin'
    )
);

CREATE POLICY "suppliers select"
ON public.suppliers
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.uid_user = auth.uid()
          AND u.role = 'Admin'
    )
);

CREATE POLICY "suppliers update"
ON public.suppliers
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.uid_user = auth.uid()
          AND u.role = 'Admin'
    )
) WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.uid_user = auth.uid()
          AND u.role = 'Admin'
    )
);

-- Health quotation + e-sign schema
-- Run in Supabase SQL editor or via migration tooling.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- quotes
-- ---------------------------------------------------------------------------
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_no text not null unique,
  plan_id text not null,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'signed', 'expired', 'cancelled')),
  company_name text not null,
  company_uen text not null default '',
  contact_name text not null,
  contact_email text not null,
  contact_phone text default '',
  billing_address text default '',
  currency text not null,
  unit_price numeric not null,
  qty integer not null,
  discount numeric not null default 0,
  tax_rate numeric not null,
  subtotal numeric not null,
  tax_amount numeric not null,
  total numeric not null,
  agreed_to_terms boolean not null default false,
  signing_token text not null unique,
  quote_valid_until timestamptz null,
  signing_token_expires_at timestamptz null,
  sent_at timestamptz null,
  viewed_at timestamptz null,
  signed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quotes_signing_token_idx on public.quotes (signing_token);
create index if not exists quotes_status_idx on public.quotes (status);
alter table public.quotes add column if not exists quote_valid_until timestamptz null;
alter table public.quotes add column if not exists company_uen text not null default '';

-- ---------------------------------------------------------------------------
-- quote_signatures
-- ---------------------------------------------------------------------------
create table if not exists public.quote_signatures (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  signer_name text not null,
  signature_data text not null,
  signer_ip text null,
  signer_user_agent text null,
  signed_document_hash text null,
  created_at timestamptz not null default now(),
  constraint quote_signatures_one_per_quote unique (quote_id)
);

create index if not exists quote_signatures_quote_id_idx on public.quote_signatures (quote_id);

-- ---------------------------------------------------------------------------
-- quote_snapshots
-- ---------------------------------------------------------------------------
create table if not exists public.quote_snapshots (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  snapshot_json jsonb not null,
  document_hash text not null,
  created_at timestamptz not null default now(),
  constraint quote_snapshots_one_per_quote unique (quote_id)
);

create index if not exists quote_snapshots_quote_id_idx on public.quote_snapshots (quote_id);

-- ---------------------------------------------------------------------------
-- quote_line_items
-- ---------------------------------------------------------------------------
create table if not exists public.quote_line_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  title text not null,
  qty integer not null default 0,
  unit_price numeric not null default 0,
  amount numeric not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists quote_line_items_quote_id_idx
  on public.quote_line_items (quote_id, sort_order);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at
  before update on public.quotes
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Atomic sign: validates token, inserts signature + snapshot, updates quote
-- ---------------------------------------------------------------------------
create or replace function public.sign_quote_by_token(
  p_token text,
  p_signer_name text,
  p_signature_data text,
  p_signer_ip text,
  p_signer_user_agent text,
  p_snapshot jsonb,
  p_document_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quote public.quotes%rowtype;
begin
  select * into v_quote
  from public.quotes
  where signing_token = p_token
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'NOT_FOUND');
  end if;

  if v_quote.signing_token_expires_at is not null
     and v_quote.signing_token_expires_at < now() then
    update public.quotes
      set status = 'expired', updated_at = now()
      where id = v_quote.id and status <> 'signed';
    return jsonb_build_object('ok', false, 'code', 'EXPIRED');
  end if;

  if v_quote.status = 'signed' then
    return jsonb_build_object('ok', false, 'code', 'ALREADY_SIGNED');
  end if;

  if v_quote.status in ('expired', 'cancelled') then
    return jsonb_build_object('ok', false, 'code', 'INVALID_STATUS');
  end if;

  update public.quotes
  set
    status = 'signed',
    signed_at = now(),
    agreed_to_terms = true,
    updated_at = now()
  where id = v_quote.id
    and status in ('draft', 'sent');

  if not found then
    return jsonb_build_object('ok', false, 'code', 'CONFLICT');
  end if;

  insert into public.quote_signatures (
    quote_id,
    signer_name,
    signature_data,
    signer_ip,
    signer_user_agent,
    signed_document_hash
  ) values (
    v_quote.id,
    p_signer_name,
    p_signature_data,
    p_signer_ip,
    p_signer_user_agent,
    p_document_hash
  );

  insert into public.quote_snapshots (
    quote_id,
    snapshot_json,
    document_hash
  ) values (
    v_quote.id,
    p_snapshot,
    p_document_hash
  );

  return jsonb_build_object(
    'ok', true,
    'quote_id', v_quote.id
  );
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'code', 'ALREADY_SIGNED');
end;
$$;

revoke all on function public.sign_quote_by_token(
  text, text, text, text, text, jsonb, text
) from public;
grant execute on function public.sign_quote_by_token(
  text, text, text, text, text, jsonb, text
) to service_role;

-- ---------------------------------------------------------------------------
-- RLS: block direct client access; server uses service role
-- ---------------------------------------------------------------------------
alter table public.quotes enable row level security;
alter table public.quote_signatures enable row level security;
alter table public.quote_snapshots enable row level security;
alter table public.quote_line_items enable row level security;

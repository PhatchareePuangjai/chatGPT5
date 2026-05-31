create table if not exists coupons (
  code text primary key,
  status text not null check (status in ('active','disabled')),
  valid_from date null,
  valid_until date null,
  min_spend_amount integer not null default 0,
  discount_type text not null check (discount_type in ('fixed_amount','percent')),
  discount_value integer not null,
  per_user_limit integer null
);

create index if not exists coupons_status_idx on coupons(status);

create table if not exists promotions (
  id text primary key,
  status text not null check (status in ('active','disabled')),
  valid_from date null,
  valid_until date null,
  promotion_type text not null check (promotion_type in ('cart_total_percent')),
  value integer not null
);

create index if not exists promotions_status_idx on promotions(status);

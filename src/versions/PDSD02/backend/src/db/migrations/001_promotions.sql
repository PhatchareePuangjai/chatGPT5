-- Promotions and Discounts initial schema

create table if not exists coupons (
  id text primary key,
  code text not null unique,
  amount_satang integer not null check (amount_satang >= 0),
  min_spend_satang integer not null default 0 check (min_spend_satang >= 0),
  expires_at timestamptz null,
  usage_limit_per_user integer null,
  is_active boolean not null default true
);

create table if not exists promotions (
  id text primary key,
  name text not null,
  percent_basis_points integer not null check (percent_basis_points between 0 and 10000),
  is_active boolean not null default true
);

create table if not exists orders (
  id text primary key,
  user_id text not null,
  subtotal_satang integer not null check (subtotal_satang >= 0),
  discount_total_satang integer not null check (discount_total_satang >= 0),
  grand_total_satang integer not null check (grand_total_satang >= 0),
  created_at timestamptz not null default now()
);

create table if not exists coupon_redemptions (
  id text primary key,
  coupon_id text not null references coupons(id),
  user_id text not null,
  order_id text null references orders(id),
  redeemed_at timestamptz not null default now()
);

create unique index if not exists coupon_redemptions_one_time_idx
  on coupon_redemptions(coupon_id, user_id);


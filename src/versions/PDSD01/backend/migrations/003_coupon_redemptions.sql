create table if not exists coupon_redemptions (
  id bigserial primary key,
  user_id text not null,
  coupon_code text not null references coupons(code),
  order_id text not null,
  redeemed_at timestamptz not null default now()
);

create index if not exists coupon_redemptions_user_coupon_idx on coupon_redemptions(user_id, coupon_code);

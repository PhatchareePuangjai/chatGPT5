-- Initial schema placeholder.
-- Real schema is added in later migrations for coupons/promotions.

-- Keep a tiny table to validate migration runner connectivity.
create table if not exists app_meta (
  key text primary key,
  value text not null
);

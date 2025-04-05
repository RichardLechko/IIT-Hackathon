create table users (
id SERIAL primary key,
name text not null,
email text unique not null,
password_hash text not null,
is_restaurant boolean default false,
lat double precision,
lng double precision,
created_at timestamp default current_timestamp);


create table deals(
id serial primary key,
restaurant_id integer references users(id) on delete cascade,
title text not null,
description text,
quantity integer not null,
pickup_start timestamp not null,
pickup_end timestamp not null,
lat double precision,
lng double precision,
claimed boolean default false,
created_at timestamp default current_timestamp);


create table claims(
id serial primary key,
deal_id integer references deals(id) on delete cascade,
customer_id integer references users(id) on delete cascade,
claimed_at timestamp default current_timestamp,
confirmed boolean default false);

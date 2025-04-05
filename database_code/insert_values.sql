INSERT INTO users (name, email, password_hash, is_restaurant, lat, lng)
VALUES ('Burger Queen', 'bq@example.com', 'hashed_pw', TRUE, 37.7749, -122.4194);


INSERT INTO deals (restaurant_id, title, description, quantity, pickup_start, pickup_end, lat, lng)
VALUES (1, '4 Cheeseburgers', 'Still fresh!', 4, NOW(), NOW() + INTERVAL '30 minutes', 37.7749, -122.4194);

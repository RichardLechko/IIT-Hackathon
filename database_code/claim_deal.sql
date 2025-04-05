-- customer claimns the deal 
INSERT INTO claims (deal_id, customer_id)
VALUES (1, 1);

UPDATE deals SET claimed = TRUE WHERE id = 1;

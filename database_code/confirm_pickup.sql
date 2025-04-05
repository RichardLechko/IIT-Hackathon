-- restaurant confirms the pickup
UPDATE claims SET confirmed = TRUE WHERE deal_id = 1 AND customer_id = 1;

-- chekcing deals within 2km radius
SELECT * FROM deals
WHERE claimed = FALSE
AND pickup_end > NOW()
AND earth_distance(ll_to_earth(37.78, -122.42), ll_to_earth(lat, lng)) < 2000;

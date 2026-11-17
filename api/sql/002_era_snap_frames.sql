ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_theme_check;
UPDATE orders SET theme = CASE theme WHEN 'idol' THEN '1989' WHEN 'anime' THEN 'lover' ELSE theme END;
ALTER TABLE orders ALTER COLUMN theme TYPE VARCHAR(24);
ALTER TABLE orders ADD CONSTRAINT orders_theme_check CHECK (theme IN ('debut','fearless','speak-now','red','1989','reputation','lover','folklore','evermore','midnights','ttpd','1989-vault','red-tv','speak-now-tv','fearless-tv'));

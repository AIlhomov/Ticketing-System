--
-- Insert some data into the database. Using CSV files to insert data.
--
use ticket;

DELETE FROM knowledge_base; -- Clear the knowledge_base table.
DELETE FROM users;
DELETE FROM attachments;
DELETE FROM tickets;
DELETE FROM categories;

--
-- Enable LOAD DATA LOCAL INFILE on the server.
--
SET GLOBAL local_infile = 1;
SHOW VARIABLES LIKE 'local_infile';

LOAD DATA LOCAL INFILE 'categories.csv'
INTO TABLE categories
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id, name);

LOAD DATA LOCAL INFILE 'ticket.csv'
INTO TABLE tickets
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(id, title, description, category_id, status);

LOAD DATA LOCAL INFILE 'users.csv'
INTO TABLE users
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n' -- Should it be with \r\n?
IGNORE 1 ROWS
(id, username, password, google_id, email, role)
SET google_id = NULLIF(google_id, 'NULL');

LOAD DATA LOCAL INFILE 'knowledge_base.csv'
INTO TABLE knowledge_base
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id, title, content, category, created_by, created_at);

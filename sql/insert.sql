--
-- Insert some data into the database. Using CSV files to insert data.
--

DELETE FROM attachments; -- Clear the attachments table.
DELETE FROM tickets;
DELETE FROM users;
--
-- Enable LOAD DATA LOCAL INFILE on the server.
--
SET GLOBAL local_infile = 1;
SHOW VARIABLES LIKE 'local_infile';

LOAD DATA LOCAL INFILE 'ticket.csv'
INTO TABLE tickets
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(id, title, description, category, status);

LOAD DATA LOCAL INFILE 'users.csv'
INTO TABLE users
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n' -- Should it be with \r\n?
IGNORE 1 ROWS
(id, username, password, google_id, email, role)
SET google_id = NULLIF(google_id, 'NULL');
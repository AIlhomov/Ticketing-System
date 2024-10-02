use ticket;

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS attachments;
DROP TABLE IF EXISTS tickets;

CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'open',
    email VARCHAR(255),
    user_id INT,
    claimed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,  -- Username for regular login
    password VARCHAR(255),         -- Hashed password for regular login
    google_id VARCHAR(255),        -- Google ID for Google login
    email VARCHAR(255) UNIQUE,     -- User email (from Google or registration)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role ENUM('admin', 'user') DEFAULT 'user'
);


SHOW WARNINGS;

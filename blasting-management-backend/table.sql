create database quarrmaster;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,     -- Store hashed password
    email VARCHAR(100) NOT NULL UNIQUE,
    role_id INT,                        -- Foreign key to roles table
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

ALTER TABLE users
ADD COLUMN status BOOLEAN DEFAULT TRUE;   --If you already have data in the users table and you’re adding a new column with a NOT NULL constraint, this might cause an issue, 
                                            --especially if some users do not have a value for the new status column. To prevent errors, add the column with a default value that applies to all existing users

CREATE TABLE IF NOT EXISTS mining_licenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_holder_id INT,
    issue_date DATE NOT NULL,
    end_date DATE NOT NULL,
    district VARCHAR(255) NOT NULL,
    license_photo_url VARCHAR(255),
    max_hole_per_blast INT NOT NULL,
    max_blasts_per_day INT NOT NULL,
    max_depth_of_hole DECIMAL(10,2) NOT NULL,
    max_spacing DECIMAL(10,2) NOT NULL,
    max_burden DECIMAL(10,2) NOT NULL,
    max_watergel_per_hole DECIMAL(10,2) NOT NULL,
    max_anfo_per_hole DECIMAL(10,2) NOT NULL,
    third_party_monitoring_required BOOLEAN DEFAULT false,
    status ENUM('active', 'expired', 'suspended', 'revoked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (license_holder_id) REFERENCES license_holders(id) 
);
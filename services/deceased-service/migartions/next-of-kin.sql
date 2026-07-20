CREATE TABLE next_of_kin (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    deceased_id VARCHAR(100) NOT NULL,

    full_name VARCHAR(255) NOT NULL,

    relationship VARCHAR(100) NOT NULL,

    contact VARCHAR(30) NOT NULL,


    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,


    INDEX(deceased_id)

);
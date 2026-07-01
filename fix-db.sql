DROP USER IF EXISTS 'restpoint_user'@'%';
DROP USER IF EXISTS 'restpoint_user'@'localhost';
CREATE USER 'restpoint_user'@'%' IDENTIFIED BY 'RestPointUser2024';
CREATE USER 'restpoint_user'@'localhost' IDENTIFIED BY 'RestPointUser2024';
GRANT ALL PRIVILEGES ON *.* TO 'restpoint_user'@'%' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'restpoint_user'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
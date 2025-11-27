#!/bin/sh
cd backend
mysql -u root -p < schema.sql
mysql -u root -p -D TimeGarden -e "DROP USER IF EXISTS 'timegarden_app'@'%'; CREATE USER 'timegarden_app'@'%' IDENTIFIED BY '12345678'; GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON TimeGarden.* TO 'timegarden_app'@'%'; FLUSH PRIVILEGES;"
mysql -u root -p TimeGarden < db_security.sql

# sh run_db_scripts.sh
# change the .env DB_USER to timegardedn_app. 
# for Least privilege on the DB connection. the backend now refuses to start 
# with root when DB_REQUIRE_NON_ROOT=true, pushing you to use the timegarden_app user 
#you create with only the needed grants (SELECT/INSERT/UPDATE/DELETE/EXECUTE).


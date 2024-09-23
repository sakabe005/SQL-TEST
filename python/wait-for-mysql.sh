#!/bin/bash

# MySQLが起動するまで待機するスクリプト
echo "DB_HOST: $DB_HOST"
echo "DB_USERNAME: $DB_USERNAME"
echo "DB_PASSWORD: $DB_PASSWORD"

until mysql -h $DB_HOST -u $DB_USERNAME -p$DB_PASSWORD -e "select 1" > /dev/null 2>&1; do
  echo "Waiting for MySQL to be ready at $DB_HOST with user $DB_USERNAME..."
  sleep 2
done

echo "MySQL is ready!"
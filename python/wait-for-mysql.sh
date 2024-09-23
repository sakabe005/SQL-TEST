#!/bin/sh
# wait-for-mysql.sh

while ! nc -z mysql 3306; do
  sleep 1
done
exec "$@"

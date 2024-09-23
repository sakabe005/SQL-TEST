#!/bin/bash

# MySQLデータベースのセットアップ
mysql -h $DB_HOST -u $DB_USERNAME -p$DB_PASSWORD <<EOF
CREATE DATABASE IF NOT EXISTS kobe CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE kobe;
EOF

# CSVファイルのインポート
python /usr/src/app/import_csv.py

# prediction.py を実行
python /usr/src/app/prediction.py
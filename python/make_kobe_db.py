import os
import csv
import mysql.connector
from mysql.connector import errorcode

# データベース接続情報
config = {
    'user': os.getenv('DB_USERNAME'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
}

# データベース接続
try:
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    print("connected")

    # データベースの作成
    cursor.execute("CREATE DATABASE IF NOT EXISTS kobe CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci")
    cursor.execute("USE kobe")

    # テーブルの作成
    table_name = "eurf310005_2013"
    cursor.execute(f"""
        DROP TABLE IF EXISTS {table_name};
    """)
    cursor.execute(f"""
        CREATE TABLE {table_name} (
            eurf_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
            yyyymm VARCHAR(6),
            lg_code VARCHAR(5),
            kobe_code VARCHAR(5),
            area VARCHAR(255),
            branch VARCHAR(255),
            sex VARCHAR(2),
            age INT,
            value INT
        )
    """)

    # CSVファイルの読み込みとデータベースへの挿入
    csv_file_path = "../kobe/2013-eurf310005.csv"
    with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row['支所等'] == '合計' or row['性別'] == '合計' or row['年齢'] == '総数':
                continue
            cursor.execute(f"""
                INSERT INTO {table_name} (yyyymm, lg_code, kobe_code, area, branch, sex, age, value)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                row['対象年月'],
                row['区CD'],
                row['行政区CD'],
                row['区名'],
                row['支所等'],
                row['性別'],
                row['年齢'],
                row['値']
            ))

    # コミットして変更を保存
    conn.commit()

except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("ユーザー名またはパスワードが間違っています")
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
        print("データベースが存在しません")
    else:
        print(err)
finally:
    cursor.close()
    conn.close()
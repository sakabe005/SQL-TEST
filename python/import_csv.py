import os
import csv
import mysql.connector
from mysql.connector import errorcode

# データベース接続情報
config = {
    'user': os.getenv('DB_USERNAME'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'database': 'kobe'
}

# データベース接続
try:
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    print("connected")

    # ディレクトリ内のCSVファイルを探してインポート
    csv_dir = "./kobe"
    if not os.path.exists(csv_dir):
        raise FileNotFoundError(f"Directory {csv_dir} does not exist.")
    else:
        print(f"Directory {csv_dir} exists."+str(os.listdir(csv_dir)))
    for filename in os.listdir(csv_dir):
        if filename.endswith("eurf310005.csv"):
            table_name = f"eurf310005_{filename[:4]}"
            print(f"Processing file: {filename}, creating table: {table_name}")
            cursor.execute(f"DROP TABLE IF EXISTS {table_name};")
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
            with open(os.path.join(csv_dir, filename), 'r') as csvfile:
                reader = csv.reader(csvfile)
                next(reader)  # ヘッダーをスキップ
                for row in reader:
                    row = row[:8]  # 最後の空白要素を削除
                    if row[-2] == "総数" or row[3] == "全市" or row[-3] == "合計":
                        continue
                    if len(row) != 8:
                        print(f"Not enough parameters for the SQL statement in file {filename}, row: {row}")
                        continue
                    cursor.execute(f"""
                        INSERT INTO {table_name} (yyyymm, lg_code, kobe_code, area, branch, sex, age, value)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """, row)
            conn.commit()
            print(f"Table {table_name} created and data inserted successfully.")

except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("Something is wrong with your user name or password")
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
        print("Database does not exist")
    else:
        print(err)
except FileNotFoundError as fnf_error:
    print(fnf_error)
finally:
    if 'cursor' in locals():
        cursor.close()
    if 'conn' in locals():
        conn.close()
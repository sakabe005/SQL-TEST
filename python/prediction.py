import mysql.connector
import pandas as pd
from prophet import Prophet
import logging

# ロギングの設定
logging.basicConfig(level=logging.INFO)

# データベース接続設定
db_config = {
    'host': 'mysql',
    'user': 'root',
    'password': 'password',
    'database': 'kobe'
}

# テーブルを作成する関数
def create_table(table_name):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute(f"CREATE TABLE IF NOT EXISTS {table_name} (id INT AUTO_INCREMENT PRIMARY KEY, area VARCHAR(255), sex VARCHAR(10), age VARCHAR(10), value INT)")
        logging.info(f"Table {table_name} created successfully.")
    except mysql.connector.Error as err:
        logging.error(f"Error: {err}")
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    create_table('2024_future')
    create_table('2030_future')

# データを取得する関数
def get_value_info(year, area, sex, age):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute(f"SELECT value FROM eurf310005_{year} WHERE area = %s AND sex = %s AND age = %s", (area, sex, age))
    value = cursor.fetchone()
    cursor.close()
    conn.close()
    return value

# 地域、年齢、性別リストを取得
def get_area_and_age_lists():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    cursor.execute("SELECT DISTINCT area FROM eurf310005_2013")
    area_list = [area[0] for area in cursor.fetchall()]

    cursor.execute("SELECT DISTINCT age FROM eurf310005_2013")
    age_list = [age[0] for age in cursor.fetchall()]

    cursor.close()
    conn.close()
    return area_list, age_list

area_list, age_list = get_area_and_age_lists()
sex_list = ["男", "女"]
year_list = range(2013, 2024)

# 予測結果を格納するDataFrameを作成
results = []

for area in area_list:
    for sex in sex_list:
        for age in age_list:
            value_list = []
            for year in year_list:
                value = get_value_info(year, area, sex, age)
                if value:
                    value_list.append(value[0])
            
            if value_list:
                df = pd.DataFrame({'ds': pd.date_range(start=f"{year_list[0]}-01-01", periods=len(value_list), freq='Y'),
                                   'y': value_list})
                
                # Prophetモデルを作成
                model = Prophet()
                model.fit(df)
                
                # 未来のデータを予測
                future = model.make_future_dataframe(periods=2, freq='Y')  # 2024年と2030年の予測
                forecast = model.predict(future)
                
                # 予測結果を保存
                results.append({
                    'area': area,
                    'sex': sex,
                    'age': age,
                    '2024_value': forecast['yhat'].iloc[-2],  # 2024年の予測値
                    '2030_value': forecast['yhat'].iloc[-1]   # 2030年の予測値
                })

# 予測結果をDataFrameとして表示
results_df = pd.DataFrame(results)
results_df['2024_value'] = results_df['2024_value'].astype(int)
results_df['2030_value'] = results_df['2030_value'].astype(int)
print(results_df)

# データをデータベースに挿入する関数
def insert_data(table_name, data):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        insert_query = f"INSERT INTO {table_name} (area, sex, age, value) VALUES (%s, %s, %s, %s)"
        cursor.executemany(insert_query, data)
        connection.commit()
        logging.info(f"{cursor.rowcount} 行が挿入されました。")
    except mysql.connector.Error as err:
        logging.error(f"エラーが発生しました: {err}")
    finally:
        cursor.close()
        connection.close()

# データをタプルのリストに変換
data_2024 = list(zip(results_df['area'], results_df['sex'], results_df['age'], results_df['2024_value']))
data_2030 = list(zip(results_df['area'], results_df['sex'], results_df['age'], results_df['2030_value']))

# 2024_futureと2030_futureテーブルにデータを挿入
insert_data('2024_future', data_2024)
insert_data('2030_future', data_2030)

FROM python:3.9-slim

WORKDIR /usr/src/app

# default-mysql-clientをインストール
RUN apt-get update && apt-get install -y default-mysql-client

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# コンテナ起動時にMySQLのセットアップとPythonスクリプトの実行を行う
CMD sh /usr/src/app/wait-for-mysql.sh && sh /usr/src/app/setup-db.sh
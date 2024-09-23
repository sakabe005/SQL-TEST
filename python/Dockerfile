FROM python:3.9-slim

WORKDIR /usr/src/app

# default-mysql-clientをインストール
RUN apt-get update && apt-get install -y default-mysql-client

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# wait-for-mysql.sh と setup-db.sh に実行権限を与える
RUN chmod +x /usr/src/app/wait-for-mysql.sh /usr/src/app/setup-db.sh

# コンテナ起動時にMySQLのセットアップとPythonスクリプトの実行を行う
CMD /usr/src/app/wait-for-mysql.sh && /usr/src/app/setup-db.sh
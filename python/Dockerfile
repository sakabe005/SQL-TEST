FROM python:3.9-slim

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# wait-for-mysql.sh (移動済み) をコピーし、実行権限を与える
COPY wait-for-mysql.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/wait-for-mysql.sh

# python prediction.py を最初に実行
CMD ["python", "prediction.py"]
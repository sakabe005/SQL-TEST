# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


# Python MySQL 統合と CSV インポート・予測

## 概要

この Docker プロジェクトは、CSV ファイルを MySQL データベースにインポートし、データ分析と Prophet を使用した予測を行う Python 環境をセットアップします。このセットアップはデータベースの作成、CSV ファイルからのデータインポートを自動化し、特定の地域、年齢層、性別に対して将来のデータを予測する Python スクリプトを実行します。

## プロジェクト構成

- `Dockerfile`: Python 3.9 と MySQL クライアントがインストールされたコンテナイメージを定義。
- `requirements.txt`: Python パッケージの依存関係 (Pandas、Prophet、MySQL Connector など)。
- `wait-for-mysql.sh`: MySQL サーバーが準備完了になるまで待機する Bash スクリプト。
- `setup-db.sh`: データベースを設定し、CSV データをインポートするための Bash スクリプト。
- `import_csv.py`: CSV データを MySQL にインポートする Python スクリプト。
- `prediction.py`: Prophet を使用して将来の値を予測する Python スクリプト。
- `kobe/`: MySQL にインポートする CSV ファイルを含むディレクトリ。

## セットアップ

### Dockerfile

Docker イメージは `python:3.9-slim` ベースで、MySQL クライアントと Python パッケージをインストールします。`wait-for-mysql.sh` スクリプトは、MySQL データベースが準備完了になるまで待機します。

### 環境変数

データベース接続には、以下の環境変数が `.env` ファイル内で必要です:

```
DB_HOST=localhost
DB_USERNAME=root
DB_PASSWORD=password
```

## プロジェクトの実行

### ステップ 1: Docker イメージのビルド

以下のコマンドで Docker イメージをビルドします:

```bash
docker build -t python-mysql-app .
```

### ステップ 2: Docker コンテナの実行

コンテナを以下のコマンドで実行します:

```bash
docker run --env-file .env -v $(pwd):/usr/src/app python-mysql-app
```

### ステップ 3: MySQL 設定とデータインポート

コンテナは自動的に `wait-for-mysql.sh` と `setup-db.sh` スクリプトを実行し、以下の操作を行います:
1. MySQL サービスの準備完了を待機。
2. 新しい MySQL データベース `kobe` を作成。
3. CSV ファイルから適切な MySQL テーブルにデータをインポート。

### ステップ 4: 予測

CSV データがインポートされた後、`prediction.py` スクリプトは Prophet を使用して 2024 年および 2030 年の予測を生成します。結果は MySQL の `2024_future` および `2030_future` テーブルに保存されます。

## スクリプト

### `wait-for-mysql.sh`

このスクリプトは MySQL サービスが準備完了になるまで、MySQL の接続状態を繰り返し確認します。

### `setup-db.sh`

このスクリプトは以下を実行します:
1. MySQL に接続。
2. 存在しない場合は `kobe` データベースを作成。
3. `kobe/` ディレクトリにある CSV ファイルからデータをインポート。

### `import_csv.py`

この Python スクリプトは `kobe/` ディレクトリから CSV ファイルを読み込み、そのデータを MySQL データベースに挿入します。また、テーブル作成と重複データの回避も行います。

### `prediction.py`

この Python スクリプトは以下を実行します:
1. MySQL から履歴データを取得。
2. Prophet モデルを使用して 2024 年と 2030 年の値を予測。
3. 予測結果を MySQL テーブルに挿入。

## 依存関係

- `pandas`
- `mysql-connector-python`
- `prophet`
- `numpy<2.0`
- `plotly`

すべての依存関係は Docker ビルド中に `requirements.txt` からインストールされます。

import os
from flask import Flask
from api_requests import api
from routes import main
from extensions import db

FLASK_RUN_HOST = os.environ.get('FLASK_RUN_HOST') or '0.0.0.0'
DB_HOST = os.environ.get('DB_HOST') or 'localhost'
POSTGRES_USER = os.environ.get('POSTGRES_USER') or 'root'
POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD') or 'pass'
POSTGRES_DB = os.environ.get('POSTGRES_DB') or 'test'
POSTGRES_PORT = os.environ.get('POSTGRES_PORT') or '5433'
DATABASE_URI = 'postgresql://' + POSTGRES_USER + ':' + POSTGRES_PASSWORD + '@' + DB_HOST + ':' + POSTGRES_PORT + '/' + POSTGRES_DB

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
db.init_app(app)
app.register_blueprint(api, url_prefix='/api')
app.register_blueprint(main)

if __name__ == '__main__':
    app.run(host="0.0.0.0")

import os
from flask import Flask
from api_requests import api
from extensions import db

POSTGRES_USER = os.environ.get('POSTGRES_USER') or 'root'
POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD') or 'pass'
POSTGRES_DB = os.environ.get('POSTGRES_DB') or 'test'
POSTGRES_PORT = os.environ.get('POSTGRES_PORT') or '5433'

DATABASE_URI = 'postgresql://' + POSTGRES_USER + ':' + POSTGRES_PASSWORD + '@localhost:' + POSTGRES_PORT + '/' + POSTGRES_DB

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
db.init_app(app)
app.register_blueprint(api, url_prefix='/api')

if __name__ == '__main__':
    app.run(host="0.0.0.0")

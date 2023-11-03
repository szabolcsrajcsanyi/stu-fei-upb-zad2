import os
from flask import Flask
from extensions import db, cache

FLASK_RUN_HOST = os.environ.get('FLASK_RUN_HOST') or '0.0.0.0'
DB_HOST = os.environ.get('DB_HOST') or 'localhost'
POSTGRES_USER = os.environ.get('POSTGRES_USER') or 'root'
POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD') or 'pass'
POSTGRES_DB = os.environ.get('POSTGRES_DB') or 'test'
POSTGRES_PORT = os.environ.get('POSTGRES_PORT') or '5433'
DATABASE_URI = 'postgresql://' + POSTGRES_USER + ':' + POSTGRES_PASSWORD + '@' + DB_HOST + ':' + POSTGRES_PORT + '/' + POSTGRES_DB

def create_app():
    app = Flask(__name__)
    
    app.config['CACHE_TYPE'] = 'simple'
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or os.urandom(16)
    app.config['COOLDOWN_TIME'] = os.environ.get('COOLDOWN_TIME') or 60
    app.config['MAX_ATTEMPTS'] = os.environ.get('MAX_ATTEMPTS') or 5
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI

    db.init_app(app)

    from api_requests import api
    app.register_blueprint(api, url_prefix='/api')
    from routes import main
    app.register_blueprint(main)
    cache.init_app(app)

    return app



if __name__ == '__main__':
    app = create_app()
    app.run(host="0.0.0.0")
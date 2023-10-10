import os
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy


POSTGRES_USER = os.environ.get('POSTGRES_USER') or 'root'
POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD') or 'pass'
POSTGRES_DB = os.environ.get('POSTGRES_DB') or 'test'
POSTGRES_PORT = os.environ.get('POSTGRES_PORT') or '5433'

DATABASE_URI = 'postgresql://'+POSTGRES_USER+':'+POSTGRES_PASSWORD+'@localhost:'+POSTGRES_PORT+'/'+POSTGRES_DB

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
db = SQLAlchemy(app)

class Customer(db.Model):
    __tablename__ = 'customers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    surname = db.Column(db.String(255))
    iban = db.Column(db.String(34))

    def __init__(self, name, surname, iban):
        self.name = name
        self.surname = surname
        self.iban = iban

    def __repr__(self):
        return f'<Customer {self.name} {self.surname}>'
    
with app.app_context():
    customers = Customer.query.all()

    for customer in customers:
        print(f"Customer ID: {customer.id}")
        print(f"Name: {customer.name}")
        print(f"Surname: {customer.surname}")
        print(f"IBAN: {customer.iban}")
        print()


@app.route('/')
def index():
    return render_template("index.html")

if __name__ == '__main__':  
   app.run(host="0.0.0.0")
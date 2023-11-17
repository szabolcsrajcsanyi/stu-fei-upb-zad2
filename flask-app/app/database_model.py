import datetime
from extensions import db

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

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)  # Renamed from 'sum' to 'amount'
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    firstname = db.Column(db.String(50), nullable=False)
    lastname = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    salt = db.Column(db.String(255), nullable=False)
    hash_pass = db.Column(db.String(255), nullable=False)
    rsa_public_key = db.Column(db.String(2048), nullable=True)
    iban = db.Column(db.String(13))
    account_balance = db.Column(db.Integer,nullable=False)
    sent_transactions = db.relationship('Transaction', foreign_keys='Transaction.sender_id')
    received_transactions = db.relationship('Transaction', foreign_keys='Transaction.recipient_id')

    def __init__(self, firstname, lastname, email, salt, hash_pass, iban):
        self.firstname = firstname
        self.lastname = lastname
        self.email = email
        self.salt = salt
        self.hash_pass = hash_pass
        self.account_balance = 0
        self.iban = iban

    def __repr__(self):
        return f'<User {self.firstname} {self.lastname} {self.email} {self.rsa_public_key}>'
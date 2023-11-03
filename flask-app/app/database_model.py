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


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    firstname = db.Column(db.String(50), nullable=False)
    lastname = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    salt = db.Column(db.String(255), nullable=False)
    hash_pass = db.Column(db.String(255), nullable=False)
    rsa_public_key = db.Column(db.String(2048), nullable=True)

    def __init__(self, firstname, lastname, email, salt, hash_pass):
        self.firstname = firstname
        self.lastname = lastname
        self.email = email
        self.salt = salt
        self.hash_pass = hash_pass

    def __repr__(self):
        return f'<User {self.firstname} {self.lastname} {self.email} {self.rsa_public_key}>'
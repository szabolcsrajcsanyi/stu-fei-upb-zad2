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

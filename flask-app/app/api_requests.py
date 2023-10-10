import json, base64
from flask import Blueprint, jsonify
from database_model import Customer
from cipher import encrypt


api = Blueprint('api', __name__)


@api.route('/customers', methods=['GET'])
def customers():
    _customers = Customer.query.all()
    # print(customers_list)
    customers_list = list()
    for customer in _customers:
        customer_dict = dict()
        customer_dict['ID'] = customer.id
        customer_dict['Name'] = customer.name
        customer_dict['Surname'] = customer.surname
        customer_dict['IBAN'] = customer.iban
        customers_list.append(customer_dict)

    cipher_text, secret_key_encrypted, iv_encrypted = encrypt(json.dumps(customers_list).encode('utf-8'))

    cipher_text_base64 = base64.b64encode(cipher_text).decode('utf-8')
    secret_key_encrypted_base64 = base64.b64encode(secret_key_encrypted).decode('utf-8')
    iv_encrypted_base64 = base64.b64encode(iv_encrypted).decode('utf-8')

    response_json = dict()
    response_json['text'] = cipher_text_base64
    response_json['secret_key'] = secret_key_encrypted_base64
    response_json['iv'] = iv_encrypted_base64

    return response_json, 200

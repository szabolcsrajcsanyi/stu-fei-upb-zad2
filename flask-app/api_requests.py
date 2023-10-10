from flask import Blueprint, jsonify
from database_model import Customer


api = Blueprint('api', __name__)


@api.route('/customers', methods=['GET'])
def customers():
    customers_list = Customer.query.all()
    customers_response_list = list()
    for customer in customers_list:
        response_dict = dict()
        response_dict['ID'] = customer.id
        response_dict['Name'] = customer.name
        response_dict['Surname'] = customer.surname
        response_dict['IBAN'] = customer.iban
        customers_response_list.append(response_dict)

    return jsonify(customers_response_list), 200

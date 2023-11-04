import json, base64, datetime, jwt
from flask import current_app as app, Blueprint, jsonify, request
from database_model import Customer, User
from cipher import encrypt
from extensions import db, cache
from functions import check_integrity, check_password_strength, validate_jwt, salted_hash, check_salted_hash
from cryptography.hazmat.primitives import serialization


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

    return jsonify(customers_list), 200

    # encoded_plaintext = json.dumps(customers_list).encode('utf-8')
    # plaintext_checksum = check_integrity(encoded_plaintext)

    # cipher_text, secret_key_encrypted, iv_encrypted = encrypt(encoded_plaintext)

    # cipher_text_base64 = base64.b64encode(cipher_text).decode('utf-8')
    # secret_key_encrypted_base64 = base64.b64encode(secret_key_encrypted).decode('utf-8')
    # iv_encrypted_base64 = base64.b64encode(iv_encrypted).decode('utf-8')
    # checksum_base64 = base64.b64encode(plaintext_checksum).decode('utf-8')

    # response_json = dict()
    # response_json['text'] = cipher_text_base64
    # response_json['secret_key'] = secret_key_encrypted_base64
    # response_json['iv'] = iv_encrypted_base64
    # response_json['checksum'] = checksum_base64

    # return response_json, 200

@api.route('/auth/customers', methods=['GET'])
def auth_customers():
    token = request.headers.get('Authorization').split(" ")[1]
    data, error, status = validate_jwt(token)
    if error:
        return error, status

    user_id = data.get('user_id')
    # user = User.query.get(user_id)
    
    user = User.query.filter_by(id=user_id).first()
    print(user_id, flush=True)
    print(user, flush=True)
    if not user or user.rsa_public_key is None:
        return {"error": "User RSA public key is missing"}, 400
 
    
    rsa_public_key = user.rsa_public_key.encode('utf-8')

    _customers = Customer.query.all()
    customers_list = list()
    for customer in _customers:
        customer_dict = dict()
        customer_dict['ID'] = customer.id
        customer_dict['Name'] = customer.name
        customer_dict['Surname'] = customer.surname
        customer_dict['IBAN'] = customer.iban
        customers_list.append(customer_dict)

    encoded_plaintext = json.dumps(customers_list).encode('utf-8')
    plaintext_checksum = check_integrity(encoded_plaintext)

    cipher_text, secret_key_encrypted, iv_encrypted = encrypt(encoded_plaintext, rsa_public_key)

    cipher_text_base64 = base64.b64encode(cipher_text).decode('utf-8')
    secret_key_encrypted_base64 = base64.b64encode(secret_key_encrypted).decode('utf-8')
    iv_encrypted_base64 = base64.b64encode(iv_encrypted).decode('utf-8')
    checksum_base64 = base64.b64encode(plaintext_checksum).decode('utf-8')

    response_json = dict()
    response_json['text'] = cipher_text_base64
    response_json['secret_key'] = secret_key_encrypted_base64
    response_json['iv'] = iv_encrypted_base64
    response_json['checksum'] = checksum_base64

    return response_json, 200


@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data:
        return jsonify({'message': 'No input data provided'}), 400
    
    firstname = data.get('firstname')
    lastname = data.get('lastname')
    email = data.get('email')
    password = data.get('password')

    if not all([firstname, lastname, email, password]):
        return jsonify({'message': 'Missing data'}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'message': 'User with given email already exists'}), 400
    
    pass_strength = check_password_strength(password)
    if pass_strength != "OK":
        return jsonify({'message': pass_strength}), 400
    

    salt, hashed_pw = salted_hash(password)
    new_user = User(firstname=firstname, lastname=lastname, email=email, salt=salt.hex(), hash_pass=hashed_pw.hex())

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'id': new_user.id,
        'firstname': new_user.firstname,
        'lastname': new_user.lastname,
        'email': new_user.email
    }), 200


@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'message': 'Missing email or password'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_salted_hash(user, password):
        failed_attempts = cache.get(f"failed_attempts_{email}") or 0
        cache.set(f"failed_attempts_{email}", failed_attempts + 1, timeout=app.config['COOLDOWN_TIME'])

        if failed_attempts >= app.config['MAX_ATTEMPTS'] - 1:
            return jsonify({'message': f'You must wait {app.config["COOLDOWN_TIME"]} seconds before trying again.'}), 429

        return jsonify({'message': 'Invalid login credentials'}), 400

    cache.delete(f"failed_attempts_{email}")

    token_payload = {
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    token = jwt.encode(token_payload, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({'message': 'Login successful', 'token': token}), 200


@api.route('/auth/upload_key', methods=['POST'])
def save_rsa_key():
    token = request.headers.get('Authorization').split(" ")[1]
    data, error, status = validate_jwt(token)
    if error:
        return error, status

    user_id = data.get('user_id')

    data = request.get_json()
    rsa_public_key = data.get('rsa_pem')
    if not rsa_public_key:
        return jsonify({'message': 'No RSA key provided'}), 400
    
    # pem = public_rsa_key.public_bytes(
    #     encoding=serialization.Encoding.PEM,
    #     format=serialization.PublicFormat.SubjectPublicKeyInfo
    # ).decode('utf-8')

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    try:
        user.rsa_public_key = rsa_public_key
        print(user, flush=True)
        # db.session.merge(user)
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        print("Error updating RSA key:", e)
        return jsonify({'message': 'Error updating RSA key'}), 500

    return jsonify({'message': 'RSA key saved successfully'}), 200


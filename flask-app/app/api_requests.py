import json, base64, datetime, jwt
from flask import current_app as app, Blueprint, jsonify, request
from database_model import Customer, Transaction, User
from cipher import encrypt
from extensions import db, cache
from functions import check_integrity, check_password_strength, validate_jwt, salted_hash, check_salted_hash, encode_response, generate_unique_iban


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
        return {"message": "User RSA public key is missing"}, 400
 
    
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
    addressLine1 = data.get('addressLine1')
    addressLine2 = data.get('addressLine2')
    city = data.get('city')
    state = data.get('state')
    zipCode = data.get('zipCode')
    telephone = data.get('telephone')

    if not all([firstname, lastname, email, password, addressLine1, city, state, zipCode, telephone]):
        return jsonify({'message': 'Missing data'}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'message': 'User with given email already exists'}), 400
    
    pass_strength = check_password_strength(password)
    if pass_strength != "OK":
        return jsonify({'message': pass_strength}), 400
    

    salt, hashed_pw = salted_hash(password)

    new_user = User(firstname=firstname, 
                    lastname=lastname, 
                    email=email, 
                    addressLine1=addressLine1,
                    addressLine2=addressLine2,
                    city=city,
                    state=state,
                    zipCode=zipCode,
                    telephone=telephone,
                    salt=salt.hex(), 
                    hash_pass=hashed_pw.hex(), 
                    iban=generate_unique_iban(User))

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'id': new_user.id,
        'firstname': new_user.firstname,
        'lastname': new_user.lastname,
        'email': new_user.email,
        'addressLine1': new_user.addressLine1,
        'addressLine2': new_user.addressLine2,
        'city': new_user.city,
        'state': new_user.state,
        'zipCode': new_user.zipCode,
        'telephone': new_user.telephone,
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

@api.route('/auth/account_balance', methods=['GET'])
def send_account_balance():
    token = request.headers.get('Authorization').split(" ")[1]
    data, error, status = validate_jwt(token)
    if error:
        return error, status

    user_id = data.get('user_id')
    user = User.query.get(user_id)
    rsa_public_key = user.rsa_public_key.encode('utf-8')
    resposne = encode_response(rsa_public_key, user.account_balance)

    return resposne, 200

@api.route('/auth/users_iban', methods=['POST'])
def send_users_iban():
    token = request.headers.get('Authorization').split(" ")[1]
    data, error, status = validate_jwt(token)
    if error:
        return error, status

    user_id = data.get('user_id')

    requesting_user = User.query.get(user_id)
    if not requesting_user:
        return jsonify({'message': 'Requesting user not found'}), 404

    users = User.query.filter(User.id != user_id).all()

    users_info = [
        {"firstname": user.firstname, "lastname": user.lastname, "iban": user.iban}
        for user in users
    ]

    rsa_public_key = requesting_user.rsa_public_key.encode('utf-8')
    response = encode_response(rsa_public_key, users_info)

    return response, 200


@api.route('/auth/make_payment', methods=['POST'])
def make_payment():
    token = request.headers.get('Authorization').split(" ")[1]
    data, error, status = validate_jwt(token)
    if error:
        return error, status

    user_id = data.get('user_id')
    sender = User.query.get(user_id)
    if not sender:
        return jsonify({'message': 'Sender not found'}), 404

    body = request.get_json()
    recipient_iban = body.get('iban')
    amount = body.get('amount')

    if not recipient_iban or not amount:
        return jsonify({'message': 'Missing iban or amount'}), 400

    if sender.iban == recipient_iban:
        return jsonify({'message': 'Cannot transfer to own account'}), 400

    if amount <= 0:
        return jsonify({'message': 'Invalid amount'}), 400

    recipient = User.query.filter_by(iban=recipient_iban).first()
    if not recipient:
        return jsonify({'message': 'Recipient IBAN not found'}), 404

    if sender.account_balance < amount:
        return jsonify({'message': 'Insufficient funds'}), 400

    try:
        # Update account balances
        sender.account_balance -= amount
        recipient.account_balance += amount

        # Create a new transaction record
        transaction = Transaction(amount=amount, sender_id=sender.id, recipient_id=recipient.id)
        db.session.add(transaction)

        db.session.commit()
        return jsonify({'message': 'Payment successful'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error processing payment: ' + str(e)}), 500
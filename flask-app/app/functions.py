import os, re, hashlib, jwt, json, base64, random
from flask import jsonify, current_app as app
from cryptography.hazmat.primitives import hashes
from cipher import encrypt

PASSWORD_PATTERN = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#.-]{8,}$')

def validate_jwt(token):
    if not token:
        return None, jsonify({"message": "Token is missing"}), 401
    
    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None, jsonify({"message": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return None, jsonify({"message": "Invalid token"}), 401

    return data, None, None

def check_integrity(plaintext_encoded):
    hash_algorithm = hashes.SHA256()
    hash = hashes.Hash(hash_algorithm)
    hash.update(plaintext_encoded)
    checksum = hash.finalize()
    return checksum

def salted_hash(password):
    salt = os.urandom(16)
    hashed_pw = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt, hashed_pw

def check_salted_hash(user, password):
    stored_salt = bytes.fromhex(user.salt)
    computed_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), stored_salt, 100000).hex()
    return computed_hash == user.hash_pass

def check_password_strength(password):
    with open('100k-most-used-passwords-NCSC.txt', 'r') as file:
        common_passwords_set = {line.strip() for line in file}

    if password in common_passwords_set:
        return "Password is too common. Please choose a different one."
    
    if not PASSWORD_PATTERN.match(password):
        return "Password doesn't meet complexity requirements."
    
    return "OK"

def encode_response(rsa_public_key, plain_text):
    encoded_plaintext = json.dumps(plain_text).encode('utf-8')
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
    return response_json


def generate_unique_iban(User):
    while True:
        new_iban =  f'SK{random.randint(100000000, 999999999)}'
        existing_user = User.query.filter_by(iban=new_iban).first()
        if not existing_user:
            return new_iban

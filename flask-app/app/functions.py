import os, re, hashlib, jwt
from flask import jsonify, current_app as app
from cryptography.hazmat.primitives import hashes

PASSWORD_PATTERN = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$')

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

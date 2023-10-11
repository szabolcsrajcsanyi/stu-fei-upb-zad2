import json, base64, requests
from cryptography.hazmat.primitives import serialization
from flask import Blueprint, jsonify
from cipher import decrypt
from checksum import check_integrity

CLIENT_PRIVATE_KEY_PATH = './.secrets/client_private_key.pem'
CLIENT_PRIVATE_KEY = ""

main = Blueprint('main', __name__)


@main.route('/customers', methods=['GET'])
def customers():
    with open(CLIENT_PRIVATE_KEY_PATH, "rb") as key_file:
        CLIENT_PRIVATE_KEY = serialization.load_pem_private_key(
        key_file.read(),
        password=None
    )

    response = requests.get("http://localhost:5000/api/customers")
    data = response.json()

    ciphertext_base64 = data['text']
    secret_key_encrypted_base64 = data['secret_key']
    iv_encrypted_base64 = data['iv']
    checksum_base64 = data['checksum']

    ciphertext = base64.b64decode(ciphertext_base64)
    secret_key_encrypted = base64.b64decode(secret_key_encrypted_base64)
    iv_encrypted = base64.b64decode(iv_encrypted_base64)
    sent_checksum = base64.b64decode(checksum_base64)

    decrypted_text = decrypt(ciphertext, secret_key_encrypted, iv_encrypted, CLIENT_PRIVATE_KEY)

    recieved_checksum = check_integrity(decrypted_text)

    data = json.loads(decrypted_text.decode('utf-8'))

    if recieved_checksum != sent_checksum:
        return "Checksums do not match", 400
    else:
        response_json = {
            "checksum": "Checksum match",
            "data": data
        }
        return jsonify(response_json), 200
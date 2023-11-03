import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.backends import default_backend


# PATH_TO_CLIENT_PUBLIC_KEY = "./.secrets/client_public_key.pem"
# CLIENT_PUBLIC_KEY = ""

# with open(PATH_TO_CLIENT_PUBLIC_KEY, "rb") as key_file:
    # CLIENT_PUBLIC_KEY = serialization.load_pem_public_key(
        # key_file.read()
    # )

def encrypt(plaintext, rsa_public_key):
    secret_key = os.urandom(16)
    iv = os.urandom(16)
    
    CLIENT_PUBLIC_KEY = serialization.load_pem_public_key(
        rsa_public_key.encode('utf-8'),
        backend=default_backend()
    )

    cipher = Cipher(algorithms.AES(secret_key), modes.CTR(iv))
    encryptor = cipher.encryptor()
    cipher_text = encryptor.update(plaintext)

    secret_key_encrypted = CLIENT_PUBLIC_KEY.encrypt(
        secret_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        )
    )

    iv_encrypted = CLIENT_PUBLIC_KEY.encrypt(
        iv,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        )
    )

    return cipher_text, secret_key_encrypted, iv_encrypted


def decrypt(cipher_text, secret_key, iv, client_private_key):
    secret_key_decrypted = client_private_key.decrypt(
        secret_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        )
    )

    iv_decrypted = client_private_key.decrypt(
        iv,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        )
    )

    cipher = Cipher(algorithms.AES(secret_key_decrypted), modes.CTR(iv_decrypted))
    decryptor = cipher.decryptor()
    plaintext = decryptor.update(cipher_text)

    return plaintext





# decryptor = cipher.decryptor()
# decryptor.update(cipher_text)
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.backends import default_backend


PATH_TO_CLIENT_PUBLIC_KEY = "./.secrets/client_public_key.pem"
CLIENT_PUBLIC_KEY = ""

with open(PATH_TO_CLIENT_PUBLIC_KEY, "rb") as key_file:
    CLIENT_PUBLIC_KEY = serialization.load_pem_public_key(
        key_file.read()
    )

def encrypt(plaintext):
    # Sila kluca, snazime sa pomocou co najkratsieho kluca
    # sifrovat co najviac informacie, preto sme vybrali
    # 16B*8 = 128 bitovy kluc - sucasne odporucana bezpecnost
    secret_key = os.urandom(16) # tajne klucko pre symmetricku sifru

    iv = os.urandom(16)


    cipher = Cipher(algorithms.AES(secret_key), modes.CTR(iv))
    encryptor = cipher.encryptor()
    cipher_text = encryptor.update(plaintext)

    # encrypt secret key with client's public key
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


# TODO: decrypt
def decrypt():
    pass



# decryptor = cipher.decryptor()
# decryptor.update(cipher_text)
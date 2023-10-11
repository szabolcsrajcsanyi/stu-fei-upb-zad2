from cryptography.hazmat.primitives import hashes

def check_integrity(plaintext_encoded):
    hash_algorithm = hashes.SHA256()
    hash = hashes.Hash(hash_algorithm)
    hash.update(plaintext_encoded)
    checksum = hash.finalize()
    return checksum
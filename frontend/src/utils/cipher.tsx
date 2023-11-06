import forge from 'node-forge';

export function check_public_RSA_validity(rsa_key: string): forge.pki.rsa.PublicKey {
    return  forge.pki.publicKeyFromPem(rsa_key);
}

export function check_private_RSA_validity(rsa_key: string): forge.pki.rsa.PrivateKey {
    return  forge.pki.privateKeyFromPem(rsa_key);
}

export function generateRSAKeyPair(): { publicKey: string; privateKey: string } {
    const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });

    const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);
    const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);

    return {
        publicKey: publicKeyPem,
        privateKey: privateKeyPem
    };
}

export function decipher(
    cipherText: Uint8Array, 
    secretKey: Uint8Array, 
    iv: Uint8Array, 
    clientPrivateKeyPem: string
): Uint8Array {
    const clientPrivateKey = forge.pki.privateKeyFromPem(clientPrivateKeyPem);

    const secretKeyBinary = String.fromCharCode.apply(null, Array.from(secretKey));
    const ivBinary = String.fromCharCode.apply(null, Array.from(iv));

    const secretKeyDecrypted = clientPrivateKey.decrypt(secretKeyBinary, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
        md: forge.md.sha256.create()
        }
    });
    const ivDecrypted = clientPrivateKey.decrypt(ivBinary, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
        md: forge.md.sha256.create()
        }
    });

    const secretKeyDecryptedBytes = secretKeyDecrypted;
    const ivDecryptedBytes = ivDecrypted;

    const cipher = forge.cipher.createDecipher('AES-CTR', forge.util.createBuffer(secretKeyDecryptedBytes));
    cipher.start({iv: forge.util.createBuffer(ivDecryptedBytes)});
    cipher.update(forge.util.createBuffer(cipherText));
    cipher.finish();

    const decryptedBytes = cipher.output.getBytes();

    return new Uint8Array(forge.util.binary.raw.decode(decryptedBytes));
}
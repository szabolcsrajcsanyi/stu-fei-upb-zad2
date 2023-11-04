import forge from 'node-forge';

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
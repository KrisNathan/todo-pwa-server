import { secp256k1 } from "@noble/curves/secp256k1";
import type EncryptedData from "@/domain/entities/sync_data";
import type ICrypto from "@/domain/ports/crypto";

export default class CryptoAdapter implements ICrypto {
  constructor() {}

  private base64ToBytes(base64: string): Uint8Array {
    // Use Buffer for Node.js environments
    return new Uint8Array(Buffer.from(base64, "base64"));
  }

  private hexToBytes(hex: string): Uint8Array {
    const result = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      result[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return result;
  }

  // Low-level signature verification helper (raw args)
  private async verifySignatureRaw(
    data: string,
    signature: string,
    publicKeyHex: string,
  ): Promise<boolean> {
    try {
      const dataBytes = new TextEncoder().encode(data);
      const dataHash = await crypto.subtle.digest("SHA-256", dataBytes);
      const signatureBytes = this.hexToBytes(signature);
      const publicKeyBytes = this.hexToBytes(publicKeyHex);

      return secp256k1.verify(
        signatureBytes,
        new Uint8Array(dataHash),
        publicKeyBytes,
      );
    } catch (error) {
      return false;
    }
  }

  // Low-level structure + signature verification using raw strings
  private async verifyEncryptedDataRaw(
    data: string,
    pubKey: string,
  ): Promise<boolean> {
    try {
      // Parse the outer structure
      const outerParsed = JSON.parse(data);

      let payloadString: string;
      let hasSignature = false;

      // Handle different formats
      if (outerParsed.payload && outerParsed.signature) {
        // New format with ECDSA signature
        payloadString = outerParsed.payload;
        hasSignature = true;

        // Verify ECDSA signature
        const isSignatureValid = await this.verifySignatureRaw(
          payloadString,
          outerParsed.signature,
          pubKey,
        );
        if (!isSignatureValid) {
          return false; // Signature verification failed
        }
      } else if (outerParsed.payload && outerParsed.authTag) {
        // Old HMAC format (cannot verify without private key)
        payloadString = outerParsed.payload;
        hasSignature = false;

        // Check that authTag is a valid base64 string
        try {
          this.base64ToBytes(outerParsed.authTag);
        } catch {
          return false; // Invalid authTag format
        }
      } else if (outerParsed.salt && outerParsed.iv && outerParsed.data) {
        // Original format without authentication
        payloadString = data;
        hasSignature = false;
      } else {
        return false; // Invalid format
      }

      // Parse the encrypted payload structure
      const parsed = JSON.parse(payloadString);

      // Check that all required fields are present
      if (!parsed.salt || !parsed.iv || !parsed.data) {
        return false;
      }

      // Verify that salt, iv, and data are valid base64 strings
      try {
        const salt = this.base64ToBytes(parsed.salt);
        const iv = this.base64ToBytes(parsed.iv);
        const encryptedData = this.base64ToBytes(parsed.data);

        // Check expected lengths
        if (salt.length !== 16) {
          // 128-bit salt
          return false;
        }

        if (iv.length !== 12) {
          // 96-bit IV for AES-GCM
          return false;
        }

        if (encryptedData.length === 0) {
          // Must have some encrypted data
          return false;
        }

        // Verify public key format (should be 33 bytes for compressed secp256k1 public key)
        const pubKeyBytes = this.hexToBytes(pubKey);
        if (pubKeyBytes.length !== 33) {
          return false;
        }

        // Check that the first byte indicates a compressed public key (0x02 or 0x03)
        if (pubKeyBytes[0] !== 0x02 && pubKeyBytes[0] !== 0x03) {
          return false;
        }

        // Return true only if we have verified the signature OR it's an old format
        return hasSignature; // For new format, signature must be valid. Old formats return false for security.
      } catch (base64Error) {
        // Invalid base64 encoding
        return false;
      }
    } catch (jsonError) {
      // Invalid JSON structure
      return false;
    }
  }

  // ICrypto implementation: use domain entity types
  async verifyEncryptedData(encryptedData: EncryptedData): Promise<boolean> {
    return this.verifyEncryptedDataRaw(
      encryptedData.encryptedString.value,
      encryptedData.publicKey.value,
    );
  }

  async verifySignature(encryptedData: EncryptedData): Promise<boolean> {
    try {
      const outerParsed = JSON.parse(encryptedData.encryptedString.value);
      if (!outerParsed?.payload || !outerParsed?.signature) return false;

      return this.verifySignatureRaw(
        outerParsed.payload,
        outerParsed.signature,
        encryptedData.publicKey.value,
      );
    } catch {
      return false;
    }
  }
}

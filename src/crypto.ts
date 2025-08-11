// Server-side crypto utilities with ECDSA signature verification
import { secp256k1 } from '@noble/curves/secp256k1';

// Helper function to convert base64 to Uint8Array
const base64ToBytes = (base64: string): Uint8Array => {
  return new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
};

// Helper function to convert hex string to Uint8Array
const hexToBytes = (hex: string): Uint8Array => {
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    result[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return result;
};

// Verify ECDSA signature using public key
const verifySignature = async (data: string, signature: string, publicKeyHex: string): Promise<boolean> => {
  try {
    const dataBytes = new TextEncoder().encode(data);
    const dataHash = await crypto.subtle.digest('SHA-256', dataBytes);
    const signatureBytes = hexToBytes(signature);
    const publicKeyBytes = hexToBytes(publicKeyHex);
    
    return secp256k1.verify(signatureBytes, new Uint8Array(dataHash), publicKeyBytes);
  } catch (error) {
    return false;
  }
};

/**
 * Verifies that encrypted data has the correct structure and ECDSA signature.
 * This function can verify authenticity using only the public key.
 * 
 * @param data - The encrypted data string (JSON format with payload and signature)
 * @param pubKey - The public key in hex format
 * @returns boolean indicating if the data is valid and authentic
 */
export const verifyEncryptedData = async (data: string, pubKey: string): Promise<boolean> => {
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
      const isSignatureValid = await verifySignature(payloadString, outerParsed.signature, pubKey);
      if (!isSignatureValid) {
        return false; // Signature verification failed
      }
      
    } else if (outerParsed.payload && outerParsed.authTag) {
      // Old HMAC format (cannot verify without private key)
      payloadString = outerParsed.payload;
      hasSignature = false;
      
      // Check that authTag is a valid base64 string
      try {
        base64ToBytes(outerParsed.authTag);
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
      const salt = base64ToBytes(parsed.salt);
      const iv = base64ToBytes(parsed.iv);
      const encryptedData = base64ToBytes(parsed.data);
      
      // Check expected lengths
      if (salt.length !== 16) { // 128-bit salt
        return false;
      }
      
      if (iv.length !== 12) { // 96-bit IV for AES-GCM
        return false;
      }
      
      if (encryptedData.length === 0) { // Must have some encrypted data
        return false;
      }
      
      // Verify public key format (should be 33 bytes for compressed secp256k1 public key)
      const pubKeyBytes = hexToBytes(pubKey);
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
};

/**
 * Simple function to verify just the ECDSA signature
 * @param data - The encrypted data string
 * @param pubKey - The public key in hex format
 * @returns boolean indicating if the signature is valid
 */
export const verifySignatureOnly = async (data: string, pubKey: string): Promise<boolean> => {
  try {
    const outerParsed = JSON.parse(data);
    
    if (!outerParsed.payload || !outerParsed.signature) {
      return false; // No signature to verify
    }
    
    return await verifySignature(outerParsed.payload, outerParsed.signature, pubKey);
  } catch (error) {
    return false;
  }
};


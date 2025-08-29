import type EncryptedString from "../values/encrypted_string.js";
import type PublicKey from "../values/public_key.js";

export interface SyncDataProps {
  encryptedString: EncryptedString;
  createdAt: Date;
  publicKey: PublicKey;
}

export default class SyncData {
  encryptedString: EncryptedString;
  createdAt: Date;
  publicKey: PublicKey;

  constructor({ encryptedString, createdAt, publicKey }: SyncDataProps) {
    this.encryptedString = encryptedString;
    this.createdAt = createdAt;
    this.publicKey = publicKey;
  }
}

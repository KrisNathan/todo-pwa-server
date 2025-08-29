import type EncryptedData from "../entities/sync_data";

export default interface ICrypto {
  verifyEncryptedData(encryptedData: EncryptedData): Promise<boolean>;
  verifySignature(encryptedData: EncryptedData): Promise<boolean>;
}

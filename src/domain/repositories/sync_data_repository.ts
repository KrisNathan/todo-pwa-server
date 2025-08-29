import type PublicKey from "@/domain/values/public_key";
import type EncryptedData from "../entities/sync_data";

export default interface ISyncDataRepository {
  getSyncData(publicKey: PublicKey): Promise<EncryptedData | null>;
  saveSyncData(
    encryptedData: EncryptedData,
    expirationSeconds?: number,
  ): Promise<void>;
}

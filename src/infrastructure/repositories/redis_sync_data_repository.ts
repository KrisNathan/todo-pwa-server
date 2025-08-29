import SyncData from "@/domain/entities/sync_data.js";
import type ISyncDataRepository from "@/domain/repositories/sync_data_repository";
import type PublicKey from "@/domain/values/public_key";
import type { createClient } from "redis";
import { toSyncDataDTO, type SyncDataDTO } from "../dto/sync_data_dto";
import EncryptedString from "@/domain/values/encrypted_string";

export default class RedisSyncDataRepository implements ISyncDataRepository {
  constructor(private readonly client: ReturnType<typeof createClient>) {}

  async saveSyncData(
    encryptedData: SyncData,
    expirationSeconds?: number,
  ): Promise<void> {
    const pubKey = encryptedData.publicKey;

    const key = `encryptedData:${pubKey.value}`;
    const value = JSON.stringify(toSyncDataDTO(encryptedData));

    const result = await this.client.setEx(
      key,
      expirationSeconds ?? 3600,
      value,
    ); // Expires in 1 hour
  }

  async getSyncData(publicKey: PublicKey): Promise<SyncData | null> {
    const key = `encryptedData:${publicKey.value}`;
    const result = await this.client.get(key);

    if (result === null) {
      return null;
    }

    const data = JSON.parse(result) as SyncDataDTO;
    
    return new SyncData({
      encryptedString: new EncryptedString(data.encryptedString),
      createdAt: new Date(data.createdAt),
      publicKey: publicKey,
    });
  }
}

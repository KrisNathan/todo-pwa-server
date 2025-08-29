import type PublicKey from "@/domain/values/public_key";
import type SyncData from "../entities/sync_data";
import type ISyncDataRepository from "../repositories/sync_data_repository";
import type ICrypto from "../ports/crypto";
import { InvalidDataError, OutOfDateDataError } from "../error";

export default class SyncDataService {
  constructor(
    private readonly syncDataRepository: ISyncDataRepository,
    private readonly crypto: ICrypto,
  ) {}

  async pushSyncData(syncData: SyncData): Promise<void> {
    const isDataValid = await this.crypto.verifyEncryptedData(syncData);
    if (!isDataValid) {
      throw new InvalidDataError("Invalid data");
    }

    const oldData = await this.syncDataRepository.getSyncData(
      syncData.publicKey,
    );
    if (oldData) {
      if (oldData.createdAt < syncData.createdAt) {
        throw new OutOfDateDataError("Data is not the latest");
      }
    }

    await this.syncDataRepository.saveSyncData(syncData, 60 * 60);
  }

  async pullSyncData(publicKey: PublicKey): Promise<SyncData | null> {
    const result = await this.syncDataRepository.getSyncData(publicKey);

    return result;
  }
}

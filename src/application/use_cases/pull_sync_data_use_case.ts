import type SyncData from "@/domain/entities/sync_data";
import type SyncDataService from "@/domain/services/sync_data_service";
import type PublicKey from "@/domain/values/public_key";

export default class PullSyncDataUseCase {
  constructor(private readonly syncDataService: SyncDataService) {}

  async execute(publicKey: PublicKey): Promise<SyncData | null> {
    const result = await this.syncDataService.pullSyncData(publicKey);

    return result;
  }
}

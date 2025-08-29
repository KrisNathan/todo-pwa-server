import type SyncData from "@/domain/entities/sync_data";
import type SyncDataService from "@/domain/services/sync_data_service";

export default class PushSyncDataUseCase {
  constructor(private readonly syncDataService: SyncDataService) {}

  async execute(encryptedData: SyncData) {
    await this.syncDataService.pushSyncData(encryptedData);
  }
}

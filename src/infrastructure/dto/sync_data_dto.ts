import type SyncData from "@/domain/entities/sync_data";

export interface SyncDataDTO {
  encryptedString: string;
  createdAt: string; // ISO date string
}

export function toSyncDataDTO(data: SyncData): SyncDataDTO {
  return {
    encryptedString: data.encryptedString.value,
    createdAt: data.createdAt.toISOString(),
  };
}

import { createClient } from "redis";
import RedisSyncDataRepository from "./infrastructure/repositories/redis_sync_data_repository";
import SyncDataService from "./domain/services/sync_data_service";
import CryptoAdapter from "./infrastructure/adapter/crypto";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
await redisClient.connect();

const cryptoAdapter = new CryptoAdapter();

const syncDataRepository = new RedisSyncDataRepository(redisClient);

const syncDataService = new SyncDataService(syncDataRepository, cryptoAdapter);

const compositionRoot = {
  syncDataRepository,
  syncDataService,
};

export default compositionRoot;

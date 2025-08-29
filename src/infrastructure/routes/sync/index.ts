import PullSyncDataUseCase from "@/application/use_cases/pull_sync_data_use_case";
import PushSyncDataUseCase from "@/application/use_cases/push_sync_data_use_case";
import compositionRoot from "@/composition_root";
import SyncData from "@/domain/entities/sync_data";
import EncryptedString from "@/domain/values/encrypted_string";
import PublicKey from "@/domain/values/public_key";
import { toSyncDataDTO } from "@/infrastructure/dto/sync_data_dto";
import { Hono } from "hono";
import z from "zod";

const syncRoute = new Hono();

const SyncPushSchema = z.object({
  encryptedString: z.string(),
  createdAt: z.iso.datetime(),
});

syncRoute.post("/", async (c) => {
  const publicKey = c.req.header('Authorization');
  if (!publicKey) {
    return c.json({ error: "Missing Authorization header" }, 401);
  }

  const body = await c.req.json();
  const parseResult = SyncPushSchema.safeParse(body);
  if (parseResult.error) {
    return c.json({ error: parseResult.error.message }, 400);
  }

  const { encryptedString, createdAt } = parseResult.data;

  const pushSyncDataUseCase = new PushSyncDataUseCase(
    compositionRoot.syncDataService,
  );

  const syncData = new SyncData({
    encryptedString: new EncryptedString(encryptedString),
    createdAt: new Date(createdAt),
    publicKey: new PublicKey(publicKey),
  })

  pushSyncDataUseCase.execute(syncData);

  return c.json({ message: "Success" });
});

syncRoute.get("/", async (c) => {
  const publicKey = c.req.header('Authorization');
  if (!publicKey) {
    return c.json({ error: "Missing Authorization header" }, 401);
  }

  const pullSyncDataUseCase = new PullSyncDataUseCase(compositionRoot.syncDataService);

  const syncData = await pullSyncDataUseCase.execute(new PublicKey(publicKey));

  if (!syncData) {
    return c.json({ message: "No data found" }, 404);
  }

  return c.json({ message: "Success", data: toSyncDataDTO(syncData) });
});

export default syncRoute;

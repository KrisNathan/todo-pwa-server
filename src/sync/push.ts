import { OpenAPIHono, z, createRoute } from "@hono/zod-openapi";
import { verify } from "crypto";
import { verifyEncryptedData } from "../crypto.js";

const syncPushRoute = new OpenAPIHono();

const syncPostSchema = z.object({
  pubKey: z.string(),
  data: z.string().openapi({
    example: "Sample data for sync post",
  }),
  createdAt: z.iso.datetime().openapi({
    example: "2023-10-01T12:00:00Z",
  }),
});

syncPushRoute.openapi(
  createRoute({
    method: "post",
    path: "/sync/push",
    request: {
      body: {
        content: {
          "application/json": {
            schema: syncPostSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Sync post successful",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
      400: {
        description: "Bad Request",
      },
    },
  }),
  (c) => {
    const { pubKey, data, createdAt } = c.req.valid("json");

    // TODO: verify data (encrypted) with the pubKey

    const isEncryptionValid = verifyEncryptedData(data, pubKey);
    if (!isEncryptionValid) {
      return c.json(
        { error: "Invalid encrypted data format or verification failed." },
        400,
      );
    }

    // Check if existing data with same pubKey exists
    // If it does exist, check if the stored data has newer createdAt
    // If the new createdAt is newer, continue:
    // Next save to redis: pubKey as key, data and createdAt as fields
    //

    return c.json({
      message: `Sync post successful.`,
    });
  },
);

export default syncPushRoute;

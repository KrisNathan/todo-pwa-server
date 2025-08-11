import { OpenAPIHono, z, createRoute } from "@hono/zod-openapi";

const syncPushRoute = new OpenAPIHono();

const syncPostSchema = z.object({
  id: z.uuidv4().openapi({
    param: {
      in: "path",
      name: "id",
    },
    example: "3c490739-41d2-4a21-9f73-12e7459b819e",
  }),
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
    path: "/sync/{id}",
    request: {
      params: syncPostSchema.pick({ id: true }),
      body: {
        content: {
          "application/json": {
            schema: syncPostSchema.omit({ id: true }),
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
    const { id } = c.req.valid("param");
    return c.json({
      message: `Sync post successful for ID: ${id}`,
    });
  }
);


export default syncPushRoute;

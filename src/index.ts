import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import syncPushRoute from "./sync/push.js";

const app = new OpenAPIHono();

app.route("/", syncPushRoute);

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Todo PWA Sync Server API",
    version: "1.0.0",
  },
});

app.get(
  "/doc",
  swaggerUI({ url: "/openapi.json" })
);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

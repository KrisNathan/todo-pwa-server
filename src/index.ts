import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import syncRoute from "./infrastructure/routes/sync";
import { HOSTNAME, MODE, PORT } from "./shared/env";

const app = new Hono();

app.use("*", cors({
  origin: MODE === "development" ? ["http://localhost:5173", "https://todo-pwa.pages.dev"] : [],
  credentials: true,
}));
app.route("/api/sync", syncRoute);

serve(
  {
    fetch: app.fetch,
    port: PORT,
    hostname: HOSTNAME
  },
  (info) => {
    console.log(`Server is running on http://${HOSTNAME}:${info.port}`);
  },
);

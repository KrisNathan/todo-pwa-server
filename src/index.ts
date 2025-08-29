import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import syncRoute from "./infrastructure/routes/sync";

const app = new Hono();

app.use("*", cors({
  origin: ["http://localhost:5173", "https://todo-pwa.pages.dev"],
  credentials: true,
}));
app.route("/api/sync", syncRoute);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

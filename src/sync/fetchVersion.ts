import { OpenAPIHono, z, createRoute } from "@hono/zod-openapi";

const fetchVersionRoute = new OpenAPIHono();

const fetchVersionSchema = z.object();

export default fetchVersionRoute;
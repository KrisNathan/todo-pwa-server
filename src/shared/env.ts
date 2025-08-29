export const PORT = Number(process.env.PORT || 3000);
export const HOSTNAME = process.env.HOSTNAME || "localhost";
export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

type Mode = "development" | "production";
const envMode = process.env.MODE;
export const MODE: Mode = envMode === "production" ? "production" : "development";
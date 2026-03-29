import path from "node:path";

export const PORT = Number(process.env.PORT ?? 3000);
export const DATABASE_PATH = process.env.DATABASE_PATH ?? path.resolve(process.cwd(), "data", "app.db");
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "changeme123";

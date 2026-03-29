import "reflect-metadata";
import { randomUUID } from "node:crypto";
import cors from "cors";
import express from "express";
import rTracer from "cls-rtracer";
import { initializeDatabase } from "./infra/datasource.js";
import { errorHandler } from "./infra/errorHandler.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { publicRouter } from "./routes/publicRoutes.js";

export async function createApp(databasePath?: string) {
  await initializeDatabase(databasePath);

  const app = express();
  app.use(rTracer.expressMiddleware({ useHeader: true, requestIdFactory: () => randomUUID() }));
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ code: 0, message: "ok", data: { status: "ok" } });
  });

  app.use("/api/v1", publicRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use(errorHandler);

  return app;
}

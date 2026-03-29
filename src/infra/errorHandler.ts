import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./HttpError.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      details: err.details
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Internal Server Error";
  res.status(500).json({
    code: "INTERNAL_ERROR",
    message
  });
}

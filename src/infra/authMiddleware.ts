import type { NextFunction, Request, Response } from "express";
import { authenticateAdminFromHeader, type AuthenticatedAdmin } from "./auth.js";

declare module "express-serve-static-core" {
  interface Request {
    adminUser?: AuthenticatedAdmin;
  }
}

export async function requireAdminAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    req.adminUser = await authenticateAdminFromHeader(req.header("authorization") ?? undefined);
    next();
  } catch (error) {
    next(error);
  }
}

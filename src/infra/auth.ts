import { compare } from "bcryptjs";
import { ADMIN_USERNAME } from "./constants.js";
import { UnauthorizedError } from "./HttpError.js";
import { getAdminUserRepository } from "./datasource.js";

export type AuthenticatedAdmin = {
  id: number;
  username: string;
};

export async function authenticateAdminFromHeader(header?: string): Promise<AuthenticatedAdmin> {
  if (!header?.startsWith("Basic ")) {
    throw new UnauthorizedError();
  }

  const decoded = Buffer.from(header.slice("Basic ".length), "base64").toString("utf8");
  const [username, password] = decoded.split(":");
  if (!username || !password) {
    throw new UnauthorizedError();
  }

  const repo = getAdminUserRepository();
  const admin = await repo.findOne({ where: { username, status: "active" } });
  if (!admin || username !== ADMIN_USERNAME) {
    throw new UnauthorizedError();
  }

  const matched = await compare(password, admin.passwordHash);
  if (!matched) {
    throw new UnauthorizedError();
  }

  return { id: admin.id, username: admin.username };
}

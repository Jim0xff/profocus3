import fs from "node:fs";
import path from "node:path";
import { hash } from "bcryptjs";
import { DataSource } from "typeorm";
import { Activity } from "../models/activity.js";
import { AdminUser } from "../models/adminUser.js";
import { Registration } from "../models/registration.js";
import { CreateAdminUsers1711800000001 } from "../migrations/1711800000001-CreateAdminUsers.js";
import { CreateActivities1711800000002 } from "../migrations/1711800000002-CreateActivities.js";
import { CreateRegistrations1711800000003 } from "../migrations/1711800000003-CreateRegistrations.js";
import { ADMIN_PASSWORD, ADMIN_USERNAME, DATABASE_PATH } from "./constants.js";

let dataSource: DataSource | null = null;

export function createAppDataSource(databasePath = DATABASE_PATH) {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  return new DataSource({
    type: "sqljs",
    location: databasePath,
    autoSave: true,
    entities: [Activity, AdminUser, Registration],
    migrations: [
      CreateAdminUsers1711800000001,
      CreateActivities1711800000002,
      CreateRegistrations1711800000003
    ],
    logging: false,
    synchronize: false
  });
}

export async function initializeDatabase(databasePath?: string) {
  if (!dataSource) {
    dataSource = createAppDataSource(databasePath);
  }

  if (!dataSource.isInitialized) {
    await dataSource.initialize();
    await dataSource.runMigrations();
    await seedAdminUser(dataSource);
  }

  return dataSource;
}

export async function destroyDatabase() {
  if (dataSource?.isInitialized) {
    await dataSource.destroy();
  }
  dataSource = null;
}

export function getDataSource() {
  if (!dataSource?.isInitialized) {
    throw new Error("Database has not been initialized");
  }

  return dataSource;
}

export function getActivityRepository() {
  return getDataSource().getRepository(Activity);
}

export function getAdminUserRepository() {
  return getDataSource().getRepository(AdminUser);
}

export function getRegistrationRepository() {
  return getDataSource().getRepository(Registration);
}

async function seedAdminUser(ds: DataSource) {
  const repo = ds.getRepository(AdminUser);
  const existing = await repo.findOne({ where: { username: ADMIN_USERNAME } });
  if (existing) {
    return;
  }

  const admin = repo.create({
    username: ADMIN_USERNAME,
    passwordHash: await hash(ADMIN_PASSWORD, 10),
    status: "active",
    lastLoginAt: null
  });
  await repo.save(admin);
}

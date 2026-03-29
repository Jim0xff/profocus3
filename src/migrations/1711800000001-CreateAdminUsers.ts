import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAdminUsers1711800000001 implements MigrationInterface {
  name = "CreateAdminUsers1711800000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "admin_users" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "username" varchar(80) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "status" varchar(32) NOT NULL DEFAULT ('active'),
        "last_login_at" datetime,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "UQ_admin_users_username" UNIQUE ("username")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "admin_users"`);
  }
}

import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRegistrations1711800000003 implements MigrationInterface {
  name = "CreateRegistrations1711800000003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "registrations" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "activity_id" integer NOT NULL,
        "name" varchar(120) NOT NULL,
        "email" varchar(190) NOT NULL,
        "phone" varchar(40) NOT NULL,
        "school" varchar(200) NOT NULL,
        "github" varchar(200) NOT NULL,
        "review_status" varchar(32) NOT NULL DEFAULT ('pending'),
        "reviewed_by" integer,
        "reviewed_at" datetime,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "uk_registrations_activity_email" UNIQUE ("activity_id", "email"),
        CONSTRAINT "CHK_registrations_review_status" CHECK ("review_status" IN ('pending', 'approved', 'rejected')),
        CONSTRAINT "FK_registrations_activity" FOREIGN KEY ("activity_id") REFERENCES "activities" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_registrations_reviewed_by" FOREIGN KEY ("reviewed_by") REFERENCES "admin_users" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_registrations_activity_id" ON "registrations" ("activity_id")`);
    await queryRunner.query(`CREATE INDEX "idx_registrations_review_status" ON "registrations" ("review_status")`);
    await queryRunner.query(`CREATE INDEX "idx_registrations_created_at" ON "registrations" ("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_registrations_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_registrations_review_status"`);
    await queryRunner.query(`DROP INDEX "idx_registrations_activity_id"`);
    await queryRunner.query(`DROP TABLE "registrations"`);
  }
}

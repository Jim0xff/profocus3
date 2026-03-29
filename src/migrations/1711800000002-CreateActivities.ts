import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateActivities1711800000002 implements MigrationInterface {
  name = "CreateActivities1711800000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "activities" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "title" varchar(200) NOT NULL,
        "description" text,
        "start_time" datetime NOT NULL,
        "end_time" datetime NOT NULL,
        "status" varchar(32) NOT NULL DEFAULT ('draft'),
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_activities_status" ON "activities" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_activities_start_time" ON "activities" ("start_time")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_activities_start_time"`);
    await queryRunner.query(`DROP INDEX "idx_activities_status"`);
    await queryRunner.query(`DROP TABLE "activities"`);
  }
}

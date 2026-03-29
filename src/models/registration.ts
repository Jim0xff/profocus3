import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from "typeorm";
import { Activity } from "./activity.js";
import { AdminUser } from "./adminUser.js";

@Entity({ name: "registrations" })
@Unique("uk_registrations_activity_email", ["activityId", "email"])
export class Registration {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index("idx_registrations_activity_id")
  @Column({ name: "activity_id", type: "integer" })
  activityId!: number;

  @ManyToOne(() => Activity, (activity) => activity.registrations, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "activity_id" })
  activity!: Activity;

  @Column({ name: "name", type: "varchar", length: 120 })
  name!: string;

  @Column({ name: "email", type: "varchar", length: 190 })
  email!: string;

  @Column({ name: "phone", type: "varchar", length: 40 })
  phone!: string;

  @Column({ name: "school", type: "varchar", length: 200 })
  school!: string;

  @Column({ name: "github", type: "varchar", length: 200 })
  github!: string;

  @Index("idx_registrations_review_status")
  @Column({ name: "review_status", type: "varchar", length: 32, default: "pending" })
  reviewStatus!: "pending" | "approved" | "rejected";

  @Column({ name: "reviewed_by", type: "integer", nullable: true })
  reviewedBy!: number | null;

  @ManyToOne(() => AdminUser, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "reviewed_by" })
  reviewer!: AdminUser | null;

  @Column({ name: "reviewed_at", type: "datetime", nullable: true })
  reviewedAt!: Date | null;

  @Index("idx_registrations_created_at")
  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;
}

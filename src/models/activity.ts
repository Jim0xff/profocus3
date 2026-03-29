import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Registration } from "./registration.js";

@Entity({ name: "activities" })
export class Activity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "title", type: "varchar", length: 200 })
  title!: string;

  @Column({ name: "description", type: "text", nullable: true })
  description!: string | null;

  @Index("idx_activities_start_time")
  @Column({ name: "start_time", type: "datetime" })
  startTime!: Date;

  @Column({ name: "end_time", type: "datetime" })
  endTime!: Date;

  @Index("idx_activities_status")
  @Column({ name: "status", type: "varchar", length: 32, default: "draft" })
  status!: string;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;

  @OneToMany(() => Registration, (registration) => registration.activity)
  registrations!: Registration[];
}

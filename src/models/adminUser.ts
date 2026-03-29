import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "admin_users" })
export class AdminUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "username", type: "varchar", length: 80, unique: true })
  username!: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({ name: "status", type: "varchar", length: 32, default: "active" })
  status!: string;

  @Column({ name: "last_login_at", type: "datetime", nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;
}

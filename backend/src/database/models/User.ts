// src/models/User.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

export type UserRole = "PATIENT" | "DOCTOR" | "ADMIN" | "STAFF";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface UserI {
  id?: number;
  username: string;
  role: UserRole;
  status: UserStatus;
  password?: string; // opcional
}

export class User extends Model<UserI> implements UserI {
  public id!: number;
  public username!: string;
  public role!: UserRole;
  public status!: UserStatus;
  public password?: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM("PATIENT", "DOCTOR", "ADMIN", "STAFF"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // opcional, para pruebas
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: false,
  }
);

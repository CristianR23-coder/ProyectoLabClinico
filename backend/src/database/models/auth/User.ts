// src/database/models/auth/User.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";
import { Role } from "./Role";
import { RoleUser } from "./RoleUser";
import { RefreshToken } from "./RefreshToken";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

  public async checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password || "");
  }

  public generateToken(): string {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET || "secret", {
      expiresIn: '10m' // Token expires in 10 minutes
    });
  }

  public generateRefreshToken(): { token: string, expiresAt: Date } {
    // const expiresIn = '24H';
    const expiresIn = '5m';
    const token = jwt.sign({ id: this.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn,
    });
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 1 minutos
    // const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    return { token, expiresAt };
  }
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

// Relaciones
User.hasMany(RoleUser, {
  foreignKey: 'user_id',
  sourceKey: "id",
});
RoleUser.belongsTo(User, {
  foreignKey: 'user_id',
  targetKey: "id",
});
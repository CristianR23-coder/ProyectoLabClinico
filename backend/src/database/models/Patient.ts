// src/models/Patient.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../db";
import { Insurance } from "./Insurance";
import { User } from "./User";

export type ActiveState = "ACTIVE" | "INACTIVE";

export interface PatientI {
  id?: number;

  docType: string;
  docNumber: string;

  firstName: string;
  lastName: string;

  birthDate?: Date | null;
  gender?: string | null;

  phone?: string | null;
  email?: string | null;
  address?: string | null;

  // FKs (en backend) para poder incluir/relacionar
  insuranceId?: number | null;
  userId?: number | null;

  status: ActiveState;
}

export class Patient extends Model<PatientI> implements PatientI {
  public id!: number;

  public docType!: string;
  public docNumber!: string;

  public firstName!: string;
  public lastName!: string;

  public birthDate?: Date | null;
  public gender?: string | null;

  public phone?: string | null;
  public email?: string | null;
  public address?: string | null;

  public insuranceId?: number | null;
  public userId?: number | null;

  public status!: ActiveState;
}

Patient.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    docType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    docNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: { msg: "Must be a valid email" },
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // FKs
    insuranceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "insurances", key: "id" },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    sequelize,
    modelName: "Patient",
    tableName: "patients",
    timestamps: false,
  }
);

// ────────────────────────────
// Relaciones
// ────────────────────────────
Insurance.hasMany(Patient, {
  foreignKey: "insuranceId",
  sourceKey: "id",
});
Patient.belongsTo(Insurance, {
  foreignKey: "insuranceId",
  targetKey: "id",
});

User.hasMany(Patient, {
  foreignKey: "userId",
  sourceKey: "id",
});
Patient.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
});


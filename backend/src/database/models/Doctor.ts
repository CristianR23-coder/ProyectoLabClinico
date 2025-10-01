// src/models/Doctor.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../db";
import { User } from "./User";

export interface DoctorI {
  id?: number;
  docType?: string;
  docNumber: string;
  name: string;
  specialty?: string;
  medicalLicense?: string;
  phone?: string;
  email?: string;
  user_id?: number; // foreign key
  status: "ACTIVE" | "INACTIVE";
}

export class Doctor extends Model<DoctorI> implements DoctorI {
  public id!: number;
  public docType?: string;
  public docNumber!: string;
  public name!: string;
  public specialty?: string;
  public medicalLicense?: string;
  public phone?: string;
  public email?: string;
  public user_id?: number;
  public status!: "ACTIVE" | "INACTIVE";
}

Doctor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    docType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    docNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    specialty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    medicalLicense: {
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users", // nombre de la tabla User
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    sequelize,
    modelName: "Doctor",
    tableName: "doctors",
    timestamps: false,
  }
);

// Relaciones
User.hasOne(Doctor, {
  foreignKey: "user_id",
  sourceKey: "id",
});

Doctor.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
});

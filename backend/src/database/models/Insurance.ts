// src/models/Insurance.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

export interface InsuranceI {
  id?: number;                           // PK
  name: string;                          // nombre
  nit?: string;                          // NIT
  phone?: string;                        // teléfono
  email?: string;                        // email
  address?: string;                      // dirección
  status: "ACTIVE" | "INACTIVE";         // estado
}

export class Insurance extends Model<InsuranceI> implements InsuranceI {
  public id!: number;
  public name!: string;
  public nit?: string;
  public phone?: string;
  public email?: string;
  public address?: string;
  public status!: "ACTIVE" | "INACTIVE";
}

Insurance.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // en muchas BD de salud, el nombre de la aseguradora se maneja único
    },
    nit: {
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
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    sequelize,
    modelName: "Insurance",
    tableName: "insurances",
    timestamps: false,
  }
);

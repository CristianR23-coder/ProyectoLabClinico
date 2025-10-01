// src/models/PatientInsurance.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../db";
import { Patient } from "./Patient";
import { Insurance } from "./Insurance";

export interface PatientInsuranceI {
  patientId: number;
  insuranceId: number;
  policyNumber?: string;
  plan?: string;
  startDate: string;                 // YYYY-MM-DD
  endDate?: string | null;           // YYYY-MM-DD
  status: "ACTIVE" | "INACTIVE";     // estado
}

export class PatientInsurance
  extends Model<PatientInsuranceI>
  implements PatientInsuranceI
{
  public patientId!: number;
  public insuranceId!: number;
  public policyNumber?: string;
  public plan?: string;
  public startDate!: string;
  public endDate?: string | null;
  public status!: "ACTIVE" | "INACTIVE";
}

PatientInsurance.init(
  {
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "patients", key: "id" },
      primaryKey: true, // clave compuesta junto con insuranceId
    },
    insuranceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "insurances", key: "id" },
      primaryKey: true,
    },
    policyNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    sequelize,
    modelName: "PatientInsurance",
    tableName: "patient_insurances",
    timestamps: false,
  }
);

// ────────────────────────────
// Relaciones
// ────────────────────────────
Patient.belongsToMany(Insurance, {
  through: PatientInsurance,
  foreignKey: "patientId",
  otherKey: "insuranceId",
});
Insurance.belongsToMany(Patient, {
  through: PatientInsurance,
  foreignKey: "insuranceId",
  otherKey: "patientId",
});

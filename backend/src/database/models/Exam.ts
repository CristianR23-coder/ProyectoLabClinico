// src/models/Exam.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

export type SpecimenType =
  | "SANGRE"
  | "SUERO"
  | "PLASMA"
  | "ORINA"
  | "SALIVA"
  | "HECES"
  | "TEJIDO"
  | "OTRA";

export interface ExamI {
  id?: number;
  code: string;
  name: string;
  method?: string;
  specimenType?: SpecimenType;
  processingTimeMin?: number | null;
  status: "ACTIVE" | "INACTIVE";
  priceBase: number;
}

export class Exam extends Model<ExamI> implements ExamI {
  public id!: number;
  public code!: string;
  public name!: string;
  public method?: string;
  public specimenType?: SpecimenType;
  public processingTimeMin?: number | null;
  public status!: "ACTIVE" | "INACTIVE";
  public priceBase!: number;
}

Exam.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    method: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    specimenType: {
      type: DataTypes.ENUM(
        "SANGRE",
        "SUERO",
        "PLASMA",
        "ORINA",
        "SALIVA",
        "HECES",
        "TEJIDO",
        "OTRA"
      ),
      allowNull: true,
      field: "specimen_type", // nombre de columna en DB
    },
    processingTimeMin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "processing_time_min",
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
    priceBase: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: "price_base",
    },
  },
  {
    sequelize,
    modelName: "Exam",
    tableName: "exams",
    timestamps: false,
  }
);

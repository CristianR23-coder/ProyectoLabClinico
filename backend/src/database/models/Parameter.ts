// src/models/Parameter.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../db";
import { Exam } from "./Exam";

export type TypeValue = "NUMERICO" | "TEXTO" | "CUALITATIVO" | "BOOLEAN";

export interface ParameterI {
  id?: number;                 // PK
  examenId: number;            // FK -> exams.id
  code?: string | null;        // código opcional
  name: string;                // nombre del parámetro
  unit?: string | null;        // unidad (mg/dL, %, etc.)
  refMin?: number | null;      // valor mínimo de referencia
  refMax?: number | null;      // valor máximo de referencia
  typeValue: TypeValue;        // tipo de valor
  decimals?: number | null;    // decimales si es numérico
  visualOrder?: number;        // orden de aparición (opcional)
  status: "ACTIVE" | "INACTIVE"; // estado lógico
}

export class Parameter extends Model<ParameterI> implements ParameterI {
  public id!: number;
  public examenId!: number;
  public code?: string | null;
  public name!: string;
  public unit?: string | null;
  public refMin?: number | null;
  public refMax?: number | null;
  public typeValue!: TypeValue;
  public decimals?: number | null;
  public visualOrder?: number;
  public status!: "ACTIVE" | "INACTIVE";
}

Parameter.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    examenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "exams", key: "id" }, // nombre de tabla en duro, como en tus otros modelos
    },

    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // usa DECIMAL para permitir precisión en rangos de referencia
    refMin: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
    },
    refMax: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
    },

    typeValue: {
      type: DataTypes.ENUM("NUMERICO", "TEXTO", "CUALITATIVO", "BOOLEAN"),
      allowNull: false,
    },

    decimals: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    visualOrder: {
      type: DataTypes.INTEGER,
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
    modelName: "Parameter",
    tableName: "parameters",
    timestamps: false,
  }
);

// Relaciones
Exam.hasMany(Parameter, {
  foreignKey: "examenId",
  sourceKey: "id",
});
Parameter.belongsTo(Exam, {
  foreignKey: "examenId",
  targetKey: "id",
});

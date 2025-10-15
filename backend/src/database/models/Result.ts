// src/models/Result.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../db";
import { Order } from "./Order";
import { Sample } from "./Sample";
import { Exam } from "./Exam";
import { Parameter } from "./Parameter";
import { Doctor } from "./Doctor";

export type ResultState = "PENDIENTE" | "VALIDADO" | "RECHAZADO";

export interface ResultI {
  id?: number;
  orderId: number;               // FK -> orders.id
  sampleId: number;              // FK -> samples.id
  examId: number;                // FK -> exams.id
  parameterId: number;           // FK -> parameters.id

  numValue?: number | null;
  textValue?: string | null;
  outRange?: boolean | null;
  dateResult?: Date | null;

  validatedForId?: number | null; // FK -> doctors.id
  validatedFor?: string | null;   // nombre del validador (snapshot)

  method?: string | null;         // snapshot desde exam.method
  units?: string | null;          // snapshot desde parameter.unit
  comment?: string | null;

  resultState: ResultState;
  status: "ACTIVE" | "INACTIVE";  // estado lógico
}

export class Result extends Model<ResultI> implements ResultI {
  public id!: number;
  public orderId!: number;
  public sampleId!: number;
  public examId!: number;
  public parameterId!: number;

  public numValue?: number | null;
  public textValue?: string | null;
  public outRange?: boolean | null;
  public dateResult?: Date | null;

  public validatedForId?: number | null;
  public validatedFor?: string | null;

  public method?: string | null;
  public units?: string | null;
  public comment?: string | null;

  public resultState!: ResultState;
  public status!: "ACTIVE" | "INACTIVE";
}

Result.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "orders", key: "id" },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
    },
    sampleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "samples", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    examId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "exams", key: "id" },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
    },
    parameterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "parameters", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    numValue: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true,
    },
    textValue: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    outRange: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    dateResult: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    validatedForId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "doctors", key: "id" },
    },
    validatedFor: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    method: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    units: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    resultState: {
      type: DataTypes.ENUM("PENDIENTE", "VALIDADO", "RECHAZADO"),
      allowNull: false,
      defaultValue: "PENDIENTE",
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    sequelize,
    modelName: "Result",
    tableName: "results",
    timestamps: false,
  }
);

// ────────────────────────────
// Relaciones
// ────────────────────────────
Order.hasMany(Result, { foreignKey: "orderId", sourceKey: "id" });
Result.belongsTo(Order, {
  foreignKey: { name: "orderId", allowNull: false },
  targetKey: "id",
  onDelete: "NO ACTION",
  onUpdate: "CASCADE",
});

Sample.hasMany(Result, { foreignKey: "sampleId", sourceKey: "id" });
Result.belongsTo(Sample, {
  foreignKey: { name: "sampleId", allowNull: false },
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Exam.hasMany(Result, { foreignKey: "examId", sourceKey: "id" });
Result.belongsTo(Exam, {
  foreignKey: { name: "examId", allowNull: false },
  targetKey: "id",
  onDelete: "NO ACTION",
  onUpdate: "CASCADE",
});

Parameter.hasMany(Result, { foreignKey: "parameterId", sourceKey: "id" });
Result.belongsTo(Parameter, {
  foreignKey: { name: "parameterId", allowNull: false },
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Doctor.hasMany(Result, { foreignKey: "validatedForId", sourceKey: "id" });
Result.belongsTo(Doctor, { foreignKey: "validatedForId", targetKey: "id" });

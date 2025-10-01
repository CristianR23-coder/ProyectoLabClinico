// src/models/Sample.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../db";
import { Order } from "./Order";
import { Exam } from "./Exam";

// Tipo de muestra (coherente con exam-model)
export type SpecimenType =
  | "SANGRE"
  | "ORINA"
  | "SALIVA"
  | "TEJIDO"
  | "LCR"; // ajusta a tu catálogo real

export type SampleState =
  | "RECOLECTADA"
  | "ALMACENADA"
  | "ENVIADA"
  | "EN_PROCESO"
  | "EVALUADA"
  | "RECHAZADA"
  | "ANULADA";

export interface SampleI {
  id?: number;
  orderId: number;                 // FK -> orders.id
  type: SpecimenType;              // tipo de espécimen
  barcode?: string;                // código de barras
  drawDate?: Date | null;          // fecha/hora de toma
  state: SampleState;              // estado de la muestra
  observations?: string | null;    // observaciones
}

export class Sample extends Model<SampleI> implements SampleI {
  public id!: number;
  public orderId!: number;
  public type!: SpecimenType;
  public barcode?: string;
  public drawDate?: Date | null;
  public state!: SampleState;
  public observations?: string | null;
}

Sample.init(
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
    },

    type: {
      type: DataTypes.STRING, // o ENUM si quieres restringir a valores concretos
      allowNull: false,
    },

    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    drawDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    state: {
      type: DataTypes.ENUM(
        "RECOLECTADA",
        "ALMACENADA",
        "ENVIADA",
        "EN_PROCESO",
        "EVALUADA",
        "RECHAZADA",
        "ANULADA"
      ),
      allowNull: false,
      defaultValue: "RECOLECTADA",
    },

    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Sample",
    tableName: "samples",
    timestamps: false,
  }
);

// ────────────────────────────
// Relaciones
// ────────────────────────────
Order.hasMany(Sample, { foreignKey: "orderId", sourceKey: "id" });
Sample.belongsTo(Order, { foreignKey: "orderId", targetKey: "id" });

// Si en algún momento quieres asociar Sample con Exam directamente:
// Exam.hasMany(Sample, { foreignKey: "type", sourceKey: "specimenType" });
// Sample.belongsTo(Exam, { foreignKey: "type", targetKey: "specimenType" });

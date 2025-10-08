// src/models/Order.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

import { Patient } from "./Patient";
import { Doctor } from "./Doctor";
import { Insurance } from "./Insurance";
import { OrderItem } from "./OrderItem";

// Estados del ciclo de la orden
export type OrderState =
  | "CREADA"
  | "TOMADA"
  | "EN_PROCESO"
  | "VALIDADA"
  | "ENTREGADA"
  | "ANULADA";

export interface OrderI {
  id?: number;
  orderDate: Date;                       // fecha/hora creación
  state: OrderState;                     // estado de proceso
  priority: "RUTINA" | "URGENTE";        // prioridad

  patientId: number;                     // FK -> patients.id
  doctorId?: number;                     // FK -> doctors.id (nullable)
  insuranceId?: number;                  // FK -> insurances.id (nullable)

  netTotal: number;                      // total de la orden
  observations?: string;                 // notas
  status: "ACTIVE" | "INACTIVE";         // estado lógico del registro
}

export class Order extends Model<OrderI> implements OrderI {
  public id!: number;
  public orderDate!: Date;
  public state!: OrderState;
  public priority!: "RUTINA" | "URGENTE";

  public patientId!: number;
  public doctorId?: number;
  public insuranceId?: number;

  public netTotal!: number;
  public observations?: string;
  public status!: "ACTIVE" | "INACTIVE";
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    orderDate: {
      type: DataTypes.DATE,              // guarda fecha y hora
      allowNull: false,
    },

    state: {
      type: DataTypes.ENUM(
        "CREADA",
        "TOMADA",
        "EN_PROCESO",
        "VALIDADA",
        "ENTREGADA",
        "ANULADA"
      ),
      allowNull: false,
      defaultValue: "CREADA",
    },

    priority: {
      type: DataTypes.ENUM("RUTINA", "URGENTE"),
      allowNull: false,
      defaultValue: "RUTINA",
    },

    // ───── FKs (según tu patrón: references con nombre de tabla en duro) ─────
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "patients", key: "id" },
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "doctors", key: "id" },
    },
    insuranceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "insurances", key: "id" },
    },

    netTotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    observations: {
      type: DataTypes.TEXT,
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
    modelName: "Order",
    tableName: "orders",
    timestamps: false,                    // igual que tus otros modelos
  }
);

// ────────────────────────────
// Relaciones
// ────────────────────────────
Patient.hasMany(Order, {
  foreignKey: "patientId",
  sourceKey: "id",
});
Order.belongsTo(Patient, {
  foreignKey: "patientId",
  targetKey: "id",
});

Doctor.hasMany(Order, {
  foreignKey: "doctorId",
  sourceKey: "id",
});
Order.belongsTo(Doctor, {
  foreignKey: "doctorId",
  targetKey: "id",
});

Insurance.hasMany(Order, {
  foreignKey: "insuranceId",
  sourceKey: "id",
});
Order.belongsTo(Insurance, {
  foreignKey: "insuranceId",
  targetKey: "id",
});


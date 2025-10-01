// src/models/OrderItem.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../db";
import { Order } from "./Order";
import { Exam } from "./Exam";

// Estados posibles de un ítem de orden
export type OrderItemState =
  | "PENDIENTE"
  | "TOMADO"
  | "EN_PROCESO"
  | "VALIDADO"
  | "ENTREGADO"
  | "ANULADO";

export interface OrderItemI {
  id?: number;          // PK
  orderId: number;      // FK -> orders.id
  examId: number;       // FK -> exams.id
  code: string;         // examen.codigo (denormalizado)
  name: string;         // examen.nombre (denormalizado)
  price: number;        // precio (puede ajustarse)
  state: OrderItemState;// estado del ítem
}

export class OrderItem extends Model<OrderItemI> implements OrderItemI {
  public id!: number;
  public orderId!: number;
  public examId!: number;
  public code!: string;
  public name!: string;
  public price!: number;
  public state!: OrderItemState;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "orders", // nombre de la tabla de Order
        key: "id",
      },
    },
    examId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "exams", // nombre de la tabla de Exam
        key: "id",
      },
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    state: {
      type: DataTypes.ENUM(
        "PENDIENTE",
        "TOMADO",
        "EN_PROCESO",
        "VALIDADO",
        "ENTREGADO",
        "ANULADO"
      ),
      allowNull: false,
      defaultValue: "PENDIENTE",
    },
  },
  {
    sequelize,
    modelName: "OrderItem",
    tableName: "order_items",
    timestamps: false,
  }
);

// Relaciones
Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  sourceKey: "id",
});
OrderItem.belongsTo(Order, {
  foreignKey: "orderId",
  targetKey: "id",
});

Exam.hasMany(OrderItem, {
  foreignKey: "examId",
  sourceKey: "id",
});
OrderItem.belongsTo(Exam, {
  foreignKey: "examId",
  targetKey: "id",
});

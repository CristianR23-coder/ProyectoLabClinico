import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

export type OrderItemState = 'PENDIENTE'|'TOMADO'|'EN_PROCESO'|'VALIDADO'|'ENTREGADO'|'ANULADO';

export interface OrderItemAttributes {
  id: number;
  orderId: number;
  examId: number;
  code: string;
  name: string;
  price: number;
  state: OrderItemState;
  createdAt?: Date; updatedAt?: Date; deletedAt?: Date | null;
}
type OrderItemCreation = Optional<OrderItemAttributes, 'id'|'createdAt'|'updatedAt'|'deletedAt'>;

export class OrderItem extends Model<OrderItemAttributes, OrderItemCreation> implements OrderItemAttributes {
  public id!: number; public orderId!: number; public examId!: number;
  public code!: string; public name!: string; public price!: number; public state!: OrderItemState;
  public readonly createdAt!: Date; public readonly updatedAt!: Date; public readonly deletedAt!: Date | null;
}
OrderItem.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'order_id' },
  examId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'exam_id' },
  code: { type: DataTypes.STRING(40), allowNull: false },
  name: { type: DataTypes.STRING(160), allowNull: false },
  price: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  state: { type: DataTypes.ENUM('PENDIENTE','TOMADO','EN_PROCESO','VALIDADO','ENTREGADO','ANULADO'), allowNull: false, defaultValue: 'PENDIENTE' },
}, {
  sequelize, modelName: 'OrderItem', tableName: 'order_items',
  timestamps: true, paranoid: true, underscored: true,
  indexes: [{ fields: ['order_id'] }, { fields: ['exam_id'] }],
});
export default OrderItem;

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

export type OrderPriority = 'RUTINA' | 'URGENTE';
export type OrderState = 'CREADA' | 'TOMADA' | 'EN_PROCESO' | 'VALIDADA' | 'ENTREGADA' | 'ANULADA';
export type ActiveState = 'ACTIVE' | 'INACTIVE';

export interface OrderAttributes {
  id: number;
  orderDate: Date;
  state: OrderState;
  priority: OrderPriority;
  patientId: number;
  doctorId?: number | null;
  insuranceId?: number | null;
  netTotal: number;
  observations?: string | null;
  status: ActiveState;
  createdAt?: Date; updatedAt?: Date; deletedAt?: Date | null;
}
type OrderCreation = Optional<OrderAttributes, 'id'|'doctorId'|'insuranceId'|'observations'|'status'|'createdAt'|'updatedAt'|'deletedAt'>;

export class Order extends Model<OrderAttributes, OrderCreation> implements OrderAttributes {
  public id!: number; public orderDate!: Date; public state!: OrderState; public priority!: OrderPriority;
  public patientId!: number; public doctorId!: number | null; public insuranceId!: number | null;
  public netTotal!: number; public observations!: string | null; public status!: ActiveState;
  public readonly createdAt!: Date; public readonly updatedAt!: Date; public readonly deletedAt!: Date | null;
}
Order.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  orderDate: { type: DataTypes.DATE, allowNull: false, field: 'order_date' },
  state: { type: DataTypes.ENUM('CREADA','TOMADA','EN_PROCESO','VALIDADA','ENTREGADA','ANULADA'), allowNull: false, defaultValue: 'CREADA' },
  priority: { type: DataTypes.ENUM('RUTINA','URGENTE'), allowNull: false, defaultValue: 'RUTINA' },
  patientId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'patient_id' },
  doctorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'doctor_id' },
  insuranceId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'insurance_id' },
  netTotal: { type: DataTypes.DECIMAL(12,2), allowNull: false, field: 'net_total' },
  observations: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('ACTIVE','INACTIVE'), allowNull: false, defaultValue: 'ACTIVE' },
}, {
  sequelize, modelName: 'Order', tableName: 'orders',
  timestamps: true, paranoid: true, underscored: true,
  indexes: [{ fields: ['patient_id'] }, { fields: ['doctor_id'] }, { fields: ['insurance_id'] }],
});
export default Order;

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

export type ActiveState = 'ACTIVE' | 'INACTIVE';

export interface InsuranceAttributes {
  id: number;
  name: string;
  nit?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  status: ActiveState;
  createdAt?: Date; updatedAt?: Date; deletedAt?: Date | null;
}
type InsuranceCreation = Optional<InsuranceAttributes, 'id'|'nit'|'phone'|'email'|'address'|'status'|'createdAt'|'updatedAt'|'deletedAt'>;

export class Insurance extends Model<InsuranceAttributes, InsuranceCreation> implements InsuranceAttributes {
  public id!: number; public name!: string; public nit!: string | null;
  public phone!: string | null; public email!: string | null; public address!: string | null;
  public status!: ActiveState; public readonly createdAt!: Date; public readonly updatedAt!: Date; public readonly deletedAt!: Date | null;
}
Insurance.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(160), allowNull: false },
  nit: { type: DataTypes.STRING(40), allowNull: true },
  phone: { type: DataTypes.STRING(40), allowNull: true },
  email: { type: DataTypes.STRING(160), allowNull: true },
  address: { type: DataTypes.STRING(180), allowNull: true },
  status: { type: DataTypes.ENUM('ACTIVE','INACTIVE'), allowNull: false, defaultValue: 'ACTIVE' },
}, {
  sequelize, modelName: 'Insurance', tableName: 'insurances',
  timestamps: true, paranoid: true, underscored: true,
});
export default Insurance;

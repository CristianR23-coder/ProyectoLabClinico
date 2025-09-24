import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

export type ActiveState = 'ACTIVE' | 'INACTIVE';

export interface PatientAttributes {
  id: number;
  docType: string;
  docNumber: string;
  firstName: string;
  lastName: string;
  birthDate?: Date | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  status: ActiveState;
  createdAt?: Date; updatedAt?: Date; deletedAt?: Date | null;
}
type PatientCreation = Optional<PatientAttributes, 'id'|'birthDate'|'gender'|'phone'|'email'|'address'|'status'|'createdAt'|'updatedAt'|'deletedAt'>;

export class Patient extends Model<PatientAttributes, PatientCreation> implements PatientAttributes {
  public id!: number; public docType!: string; public docNumber!: string;
  public firstName!: string; public lastName!: string; public birthDate!: Date | null;
  public gender!: string | null; public phone!: string | null; public email!: string | null; public address!: string | null;
  public status!: 'ACTIVE'|'INACTIVE'; public readonly createdAt!: Date; public readonly updatedAt!: Date; public readonly deletedAt!: Date | null;
}
Patient.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  docType: { type: DataTypes.STRING(20), allowNull: false, field: 'doc_type' },
  docNumber: { type: DataTypes.STRING(40), allowNull: false, unique: true, field: 'doc_number' },
  firstName: { type: DataTypes.STRING(120), allowNull: false, field: 'first_name' },
  lastName: { type: DataTypes.STRING(120), allowNull: false, field: 'last_name' },
  birthDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'birth_date' },
  gender: { type: DataTypes.STRING(10), allowNull: true },
  phone: { type: DataTypes.STRING(40), allowNull: true },
  email: { type: DataTypes.STRING(160), allowNull: true },
  address: { type: DataTypes.STRING(180), allowNull: true },
  status: { type: DataTypes.ENUM('ACTIVE','INACTIVE'), allowNull: false, defaultValue: 'ACTIVE' },
}, {
  sequelize, modelName: 'Patient', tableName: 'patients',
  timestamps: true, paranoid: true, underscored: true,
  indexes: [{ unique: true, fields: ['doc_number'] }],
});
export default Patient;

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

export type ActiveState = 'ACTIVE' | 'INACTIVE';

export interface DoctorAttributes {
  id: number;
  docType?: string | null;
  docNumber: string;
  name: string;
  specialty?: string | null;
  medicalLicense?: string | null;
  phone?: string | null;
  email?: string | null;
  status: ActiveState;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
type DoctorCreation = Optional<
  DoctorAttributes,
  'id' | 'docType' | 'specialty' | 'medicalLicense' | 'phone' | 'email' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class Doctor extends Model<DoctorAttributes, DoctorCreation> implements DoctorAttributes {
  public id!: number;
  public docType!: string | null;
  public docNumber!: string;
  public name!: string;
  public specialty!: string | null;
  public medicalLicense!: string | null;
  public phone!: string | null;
  public email!: string | null;
  public status!: ActiveState;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}
Doctor.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  docType: { type: DataTypes.STRING(20), allowNull: true, field: 'doc_type' },
  docNumber: { type: DataTypes.STRING(40), allowNull: false, unique: true, field: 'doc_number' },
  name: { type: DataTypes.STRING(160), allowNull: false },
  specialty: { type: DataTypes.STRING(120), allowNull: true },
  medicalLicense: { type: DataTypes.STRING(60), allowNull: true, field: 'medical_license' },
  phone: { type: DataTypes.STRING(40), allowNull: true },
  email: { type: DataTypes.STRING(160), allowNull: true },
  status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE'), allowNull: false, defaultValue: 'ACTIVE' },
}, {
  sequelize,
  modelName: 'Doctor',
  tableName: 'doctors',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['doc_number'] }],
});
export default Doctor;

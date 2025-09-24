import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';

export type ActiveState = 'ACTIVE' | 'INACTIVE';

export interface PatientInsuranceAttributes {
  patientId: number;
  insuranceId: number;
  policyNumber?: string | null;
  plan?: string | null;
  startDate: Date;
  endDate?: Date | null;
  status: ActiveState;
  createdAt?: Date; updatedAt?: Date; deletedAt?: Date | null;
}
export class PatientInsurance extends Model<PatientInsuranceAttributes> implements PatientInsuranceAttributes {
  public patientId!: number; public insuranceId!: number;
  public policyNumber!: string | null; public plan!: string | null;
  public startDate!: Date; public endDate!: Date | null; public status!: ActiveState;
  public readonly createdAt!: Date; public readonly updatedAt!: Date; public readonly deletedAt!: Date | null;
}
PatientInsurance.init({
  patientId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, primaryKey: true, field: 'patient_id' },
  insuranceId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, primaryKey: true, field: 'insurance_id' },
  policyNumber: { type: DataTypes.STRING(60), allowNull: true, field: 'policy_number' },
  plan: { type: DataTypes.STRING(60), allowNull: true },
  startDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'start_date' },
  endDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'end_date' },
  status: { type: DataTypes.ENUM('ACTIVE','INACTIVE'), allowNull: false, defaultValue: 'ACTIVE' },
}, {
  sequelize, modelName: 'PatientInsurance', tableName: 'patient_insurances',
  timestamps: true, paranoid: true, underscored: true,
});
export default PatientInsurance;

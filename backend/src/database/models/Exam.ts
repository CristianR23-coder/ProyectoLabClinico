import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

export const SPECIMEN_TYPES = ['SANGRE','SUERO','PLASMA','ORINA','SALIVA','HECES','TEJIDO','OTRA'] as const;
export type SpecimenType = typeof SPECIMEN_TYPES[number];
export type ActiveState = 'ACTIVE' | 'INACTIVE';

export interface ExamAttributes {
  id: number;
  code: string;
  name: string;
  method?: string | null;
  specimenType?: SpecimenType | null;
  processingTimeMin?: number | null;
  status: ActiveState;
  priceBase: number;
  createdAt?: Date; updatedAt?: Date; deletedAt?: Date | null;
}
type ExamCreation = Optional<ExamAttributes, 'id' | 'method' | 'specimenType' | 'processingTimeMin' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export class Exam extends Model<ExamAttributes, ExamCreation> implements ExamAttributes {
  public id!: number;
  public code!: string;
  public name!: string;
  public method!: string | null;
  public specimenType!: SpecimenType | null;
  public processingTimeMin!: number | null;
  public status!: ActiveState;
  public priceBase!: number;
  public readonly createdAt!: Date; public readonly updatedAt!: Date; public readonly deletedAt!: Date | null;
}
Exam.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING(40), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(160), allowNull: false },
  method: { type: DataTypes.STRING(160), allowNull: true },
  specimenType: { type: DataTypes.ENUM(...SPECIMEN_TYPES), allowNull: true, field: 'specimen_type' },
  processingTimeMin: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'processing_time_min' },
  status: { type: DataTypes.ENUM('ACTIVE','INACTIVE'), allowNull: false, defaultValue: 'ACTIVE' },
  priceBase: { type: DataTypes.DECIMAL(12,2), allowNull: false, field: 'price_base' },
}, {
  sequelize,
  modelName: 'Exam',
  tableName: 'exams',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['code'] }],
});
export default Exam;

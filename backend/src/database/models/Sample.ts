import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

export const SPECIMEN_TYPES = ['SANGRE','SUERO','PLASMA','ORINA','SALIVA','HECES','TEJIDO','OTRA'] as const;
export type SpecimenType = typeof SPECIMEN_TYPES[number];
export const SAMPLE_STATES = ['RECOLECTADA','ALMACENADA','ENVIADA','EN_PROCESO','EVALUADA','RECHAZADA','ANULADA'] as const;
export type SampleState = typeof SAMPLE_STATES[number];

export interface SampleAttributes {
  id: number;
  orderId: number;
  type: SpecimenType;
  barcode?: string | null;
  drawDate?: Date | null;
  state: SampleState;
  observations?: string | null;
  createdAt?: Date; updatedAt?: Date; deletedAt?: Date | null;
}
type SampleCreation = Optional<SampleAttributes, 'id'|'barcode'|'drawDate'|'observations'|'createdAt'|'updatedAt'|'deletedAt'>;

export class Sample extends Model<SampleAttributes, SampleCreation> implements SampleAttributes {
  public id!: number; public orderId!: number; public type!: SpecimenType; public barcode!: string | null;
  public drawDate!: Date | null; public state!: SampleState; public observations!: string | null;
  public readonly createdAt!: Date; public readonly updatedAt!: Date; public readonly deletedAt!: Date | null;
}
Sample.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'order_id' },
  type: { type: DataTypes.ENUM(...SPECIMEN_TYPES), allowNull: false },
  barcode: { type: DataTypes.STRING(64), allowNull: true, unique: true },
  drawDate: { type: DataTypes.DATE, allowNull: true, field: 'draw_date' },
  state: { type: DataTypes.ENUM(...SAMPLE_STATES), allowNull: false, defaultValue: 'RECOLECTADA' },
  observations: { type: DataTypes.TEXT, allowNull: true },
}, {
  sequelize, modelName: 'Sample', tableName: 'samples',
  timestamps: true, paranoid: true, underscored: true,
  indexes: [{ fields: ['order_id'] }, { unique: true, fields: ['barcode'] }],
});
export default Sample;

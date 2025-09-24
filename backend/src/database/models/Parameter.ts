import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

export const TYPE_VALUES = ['NUMERICO','TEXTO','CUALITATIVO','BOOLEAN'] as const;
export type TypeValue = typeof TYPE_VALUES[number];

export interface ParameterAttributes {
  id: number;
  examId: number;
  code?: string | null;
  name: string;
  unit?: string | null;
  refMin?: number | null;
  refMax?: number | null;
  typeValue: TypeValue;
  decimals?: number | null;
  visualOrder?: number | null;
  createdAt?: Date; updatedAt?: Date; deletedAt?: Date | null;
}
type ParameterCreation = Optional<ParameterAttributes, 'id'|'code'|'unit'|'refMin'|'refMax'|'decimals'|'visualOrder'|'createdAt'|'updatedAt'|'deletedAt'>;

export class Parameter extends Model<ParameterAttributes, ParameterCreation> implements ParameterAttributes {
  public id!: number; public examId!: number; public code!: string | null; public name!: string;
  public unit!: string | null; public refMin!: number | null; public refMax!: number | null;
  public typeValue!: TypeValue; public decimals!: number | null; public visualOrder!: number | null;
  public readonly createdAt!: Date; public readonly updatedAt!: Date; public readonly deletedAt!: Date | null;
}
Parameter.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  examId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'exam_id' },
  code: { type: DataTypes.STRING(40), allowNull: true },
  name: { type: DataTypes.STRING(160), allowNull: false },
  unit: { type: DataTypes.STRING(40), allowNull: true },
  refMin: { type: DataTypes.DECIMAL(18,6), allowNull: true, field: 'ref_min' },
  refMax: { type: DataTypes.DECIMAL(18,6), allowNull: true, field: 'ref_max' },
  typeValue: { type: DataTypes.ENUM(...TYPE_VALUES), allowNull: false, field: 'type_value' },
  decimals: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  visualOrder: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'visual_order' },
}, {
  sequelize, modelName: 'Parameter', tableName: 'parameters',
  timestamps: true, paranoid: true, underscored: true,
  indexes: [{ fields: ['exam_id'] }],
});
export default Parameter;

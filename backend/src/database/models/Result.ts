import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

export const RESULT_STATES = ['PENDIENTE','VALIDADO','RECHAZADO'] as const;
export type ResultState = typeof RESULT_STATES[number];

export interface ResultAttributes {
  id: number;
  orderId: number;
  sampleId: number;
  examId: number;
  parameterId: number;
  numValue?: number | null;
  textValue?: string | null;
  outRange?: boolean | null;
  dateResult?: Date | null;
  validatedForId?: number | null;
  validatedFor?: string | null;
  method?: string | null;
  units?: string | null;
  comment?: string | null;
  resultState: ResultState;
  createdAt?: Date; updatedAt?: Date; deletedAt?: Date | null;
}
type ResultCreation = Optional<ResultAttributes, 'id'|'numValue'|'textValue'|'outRange'|'dateResult'|'validatedForId'|'validatedFor'|'method'|'units'|'comment'|'createdAt'|'updatedAt'|'deletedAt'>;

export class Result extends Model<ResultAttributes, ResultCreation> implements ResultAttributes {
  public id!: number; public orderId!: number; public sampleId!: number; public examId!: number; public parameterId!: number;
  public numValue!: number | null; public textValue!: string | null; public outRange!: boolean | null;
  public dateResult!: Date | null; public validatedForId!: number | null; public validatedFor!: string | null;
  public method!: string | null; public units!: string | null; public comment!: string | null; public resultState!: ResultState;
  public readonly createdAt!: Date; public readonly updatedAt!: Date; public readonly deletedAt!: Date | null;
}
Result.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'order_id' },
  sampleId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'sample_id' },
  examId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'exam_id' },
  parameterId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'parameter_id' },
  numValue: { type: DataTypes.DECIMAL(18,6), allowNull: true, field: 'num_value' },
  textValue: { type: DataTypes.STRING(200), allowNull: true, field: 'text_value' },
  outRange: { type: DataTypes.BOOLEAN, allowNull: true, field: 'out_range' },
  dateResult: { type: DataTypes.DATE, allowNull: true, field: 'date_result' },
  validatedForId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'validated_for_id' },
  validatedFor: { type: DataTypes.STRING(160), allowNull: true, field: 'validated_for' },
  method: { type: DataTypes.STRING(160), allowNull: true },
  units: { type: DataTypes.STRING(40), allowNull: true },
  comment: { type: DataTypes.TEXT, allowNull: true },
  resultState: { type: DataTypes.ENUM(...RESULT_STATES), allowNull: false, defaultValue: 'PENDIENTE', field: 'result_state' },
}, {
  sequelize, modelName: 'Result', tableName: 'results',
  timestamps: true, paranoid: true, underscored: true,
  indexes: [{ fields: ['order_id','sample_id','exam_id','parameter_id'] }],
});
export default Result;

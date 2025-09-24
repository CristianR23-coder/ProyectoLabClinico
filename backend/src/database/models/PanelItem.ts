import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

export type PanelItemKind = 'EXAM' | 'PARAM';

export interface PanelItemAttributes {
  id: number;
  panelId: number;
  kind: PanelItemKind;
  examId?: number | null;
  parameterId?: number | null;
  required?: boolean;
  order?: number | null;
  notes?: string | null;
  createdAt?: Date; updatedAt?: Date; deletedAt?: Date | null;
}
type PanelItemCreation = Optional<PanelItemAttributes, 'id'|'examId'|'parameterId'|'required'|'order'|'notes'|'createdAt'|'updatedAt'|'deletedAt'>;

export class PanelItem extends Model<PanelItemAttributes, PanelItemCreation> implements PanelItemAttributes {
  public id!: number; public panelId!: number; public kind!: PanelItemKind;
  public examId!: number | null; public parameterId!: number | null;
  public required!: boolean; public order!: number | null; public notes!: string | null;
  public readonly createdAt!: Date; public readonly updatedAt!: Date; public readonly deletedAt!: Date | null;
}
PanelItem.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  panelId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'panel_id' },
  kind: { type: DataTypes.ENUM('EXAM','PARAM'), allowNull: false },
  examId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'exam_id' },
  parameterId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'parameter_id' },
  required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  order: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  notes: { type: DataTypes.STRING(255), allowNull: true },
}, {
  sequelize, modelName: 'PanelItem', tableName: 'panel_items',
  timestamps: true, paranoid: true, underscored: true,
  indexes: [{ fields: ['panel_id'] }, { fields: ['exam_id'] }, { fields: ['parameter_id'] }],
});
export default PanelItem;

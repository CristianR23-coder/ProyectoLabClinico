import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

export type PanelState = 'ACTIVO' | 'INACTIVO';

export interface PanelAttributes {
  id: number;
  name: string;
  description?: string | null;
  state: PanelState;
  createdAt?: Date; updatedAt?: Date; deletedAt?: Date | null;
}
type PanelCreation = Optional<PanelAttributes, 'id'|'description'|'state'|'createdAt'|'updatedAt'|'deletedAt'>;

export class Panel extends Model<PanelAttributes, PanelCreation> implements PanelAttributes {
  public id!: number; public name!: string; public description!: string | null; public state!: PanelState;
  public readonly createdAt!: Date; public readonly updatedAt!: Date; public readonly deletedAt!: Date | null;
}
Panel.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(160), allowNull: false },
  description: { type: DataTypes.STRING(255), allowNull: true },
  state: { type: DataTypes.ENUM('ACTIVO','INACTIVO'), allowNull: false, defaultValue: 'ACTIVO' },
}, {
  sequelize, modelName: 'Panel', tableName: 'panels',
  timestamps: true, paranoid: true, underscored: true,
  indexes: [{ unique: true, fields: ['name'] }],
});
export default Panel;

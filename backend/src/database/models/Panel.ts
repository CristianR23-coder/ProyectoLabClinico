// src/models/Panel.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../db";
import { PanelItem } from "./PanelItem";

export type PanelState = "ACTIVO" | "INACTIVO";

export interface PanelI {
  id?: number;
  name: string;                   // nombre del panel
  description?: string | null;    // descripción corta
  state: PanelState;              // ACTIVO / INACTIVO
  // Nota: en DB no guardamos createdAt/updatedAt porque timestamps=false (igual a tus otros modelos)
}

export class Panel extends Model<PanelI> implements PanelI {
  public id!: number;
  public name!: string;
  public description?: string | null;
  public state!: PanelState;
}

Panel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.ENUM("ACTIVO", "INACTIVO"),
      allowNull: false,
      defaultValue: "ACTIVO",
    },
  },
  {
    sequelize,
    modelName: "Panel",
    tableName: "panels",
    timestamps: false,
  }
);

// 1:N Panel → PanelItem
Panel.hasMany(PanelItem, {
  foreignKey: "panelId",
  sourceKey: "id",
});
PanelItem.belongsTo(Panel, {
  foreignKey: "panelId",
  targetKey: "id",
});

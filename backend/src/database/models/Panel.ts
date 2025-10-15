// src/models/Panel.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../db";
import { PanelItem } from "./PanelItem";

export interface PanelI {
  id?: number;
  name: string;                   // nombre del panel
  description?: string | null;    // descripción corta
  status: "ACTIVE" | "INACTIVE";  // estado lógico
  // Nota: en DB no guardamos createdAt/updatedAt porque timestamps=false (igual a tus otros modelos)
}

export class Panel extends Model<PanelI> implements PanelI {
  public id!: number;
  public name!: string;
  public description?: string | null;
  public status!: "ACTIVE" | "INACTIVE";
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
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      allowNull: false,
      defaultValue: "ACTIVE",
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
  foreignKey: { name: "panelId", allowNull: false },
  sourceKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
PanelItem.belongsTo(Panel, {
  foreignKey: { name: "panelId", allowNull: false },
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

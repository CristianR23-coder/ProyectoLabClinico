// src/models/PanelItem.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../db";
import { Panel } from "./Panel";
import { Exam } from "./Exam";         // si ya existe el modelo de Examen
import { Parameter } from "./Parameter"; // si ya existe el modelo de Parámetro (analito)

export type PanelItemKind = "EXAM" | "PARAM";

export interface PanelItemI {
  id?: number;
  panelId: number;                 // FK → panels.id
  kind: PanelItemKind;             // 'EXAM' | 'PARAM'
  examId?: number | null;          // si kind === 'EXAM'  (FK → exams.id)
  parameterId?: number | null;     // si kind === 'PARAM' (FK → parameters.id)
  required?: boolean;              // si es obligatorio
  order?: number | null;           // orden de visualización
  notes?: string | null;           // nota/observación
  status: "ACTIVE" | "INACTIVE";   // estado lógico
}

export class PanelItem extends Model<PanelItemI> implements PanelItemI {
  public id!: number;
  public panelId!: number;
  public kind!: PanelItemKind;
  public examId?: number | null;
  public parameterId?: number | null;
  public required?: boolean;
  public order?: number | null;
  public notes?: string | null;
  public status!: "ACTIVE" | "INACTIVE";
}

PanelItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    panelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "panels", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    kind: {
      type: DataTypes.ENUM("EXAM", "PARAM"),
      allowNull: false,
    },

    examId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "exams", key: "id" }, // nombre de tabla en duro, siguiendo tu patrón
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
    },

    parameterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "parameters", key: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },

    required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
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
    modelName: "PanelItem",
    tableName: "panel_items",
    timestamps: false,
  }
);

// Relaciones adicionales (opcionales si existen los modelos referenciados)
Exam.hasMany(PanelItem, {
  foreignKey: { name: "examId", allowNull: true },
  sourceKey: "id",
  onDelete: "NO ACTION",
  onUpdate: "CASCADE",
});
PanelItem.belongsTo(Exam, {
  foreignKey: { name: "examId", allowNull: true },
  targetKey: "id",
  onDelete: "NO ACTION",
  onUpdate: "CASCADE",
});

Parameter.hasMany(PanelItem, {
  foreignKey: { name: "parameterId", allowNull: true },
  sourceKey: "id",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
PanelItem.belongsTo(Parameter, {
  foreignKey: { name: "parameterId", allowNull: true },
  targetKey: "id",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

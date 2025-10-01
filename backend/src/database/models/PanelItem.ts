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
    },

    kind: {
      type: DataTypes.ENUM("EXAM", "PARAM"),
      allowNull: false,
    },

    examId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "exams", key: "id" }, // nombre de tabla en duro, siguiendo tu patrón
    },

    parameterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "parameters", key: "id" },
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
  foreignKey: "examId",
  sourceKey: "id",
});
PanelItem.belongsTo(Exam, {
  foreignKey: "examId",
  targetKey: "id",
});

Parameter.hasMany(PanelItem, {
  foreignKey: "parameterId",
  sourceKey: "id",
});
PanelItem.belongsTo(Parameter, {
  foreignKey: "parameterId",
  targetKey: "id",
});

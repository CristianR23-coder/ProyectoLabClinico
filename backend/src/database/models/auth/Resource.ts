import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";
import { Role } from "./Role";
import { ResourceRole } from "./ResourceRole";

export interface ResourceI {
  id?: number;
  path: string;
  method: string;
  is_active?: "ACTIVE" | "INACTIVE";
}

export class Resource extends Model<ResourceI> implements ResourceI {
  public id!: number;
  public path!: string;
  public method!: string;
  public is_active!: "ACTIVE" | "INACTIVE";
}

Resource.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    sequelize,
    modelName: "Resource",
    tableName: "resources",
    timestamps: true,
    underscored: true,
  }
);

import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";
import { User } from "./User";
import { Role } from "./Role";

export interface RoleUserI {
  id?: number;
  role_id: number;
  user_id: number;
  is_active?: "ACTIVE" | "INACTIVE";
}

export class RoleUser extends Model<RoleUserI> implements RoleUserI {
  public id!: number;
  public role_id!: number;
  public user_id!: number;
  public is_active!: "ACTIVE" | "INACTIVE";
}

RoleUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    sequelize,
    modelName: "RoleUser",
    tableName: "role_users",
    timestamps: true,
    underscored: true,
  }
);


import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";
import { Resource } from "./Resource";
import { Role } from "./Role";

export interface ResourceRoleI {
  id?: number;
  resource_id: number;
  role_id: number;
  is_active?: "ACTIVE" | "INACTIVE";
}

export class ResourceRole extends Model<ResourceRoleI> implements ResourceRoleI {
  public id!: number;
  public resource_id!: number;
  public role_id!: number;
  public is_active!: "ACTIVE" | "INACTIVE";
}

ResourceRole.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    resource_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role_id: {
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
    modelName: "ResourceRole",
    tableName: "resource_roles",
    timestamps: true,
    underscored: true,
  }
);

// named export via the class declaration above

// Relaciones
Resource.hasMany(ResourceRole, { foreignKey: "resource_id", as: "resourceRoles" });
ResourceRole.belongsTo(Resource, { foreignKey: "resource_id", as: "resource" });
ResourceRole.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Role.hasMany(ResourceRole, { foreignKey: "role_id", as: "resourceRoles" });

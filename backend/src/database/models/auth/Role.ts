import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";
import { User } from "./User";
import { RoleUser } from "./RoleUser";
import { Resource } from "./Resource";
import { ResourceRole } from "./ResourceRole";

export interface RoleI {
  id?: number;
  name: string;
  is_active?: "ACTIVE" | "INACTIVE";
}

export class Role extends Model<RoleI> implements RoleI {
  public id!: number;
  public name!: string;
  public is_active!: "ACTIVE" | "INACTIVE";
}

Role.init(
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
    is_active: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "roles",
    timestamps: true,
    underscored: true,
  }
);

// Associations: define in a function to avoid circular imports
// Relaciones
Role.hasMany(RoleUser, {
  foreignKey: 'role_id',
  sourceKey: "id",
});
RoleUser.belongsTo(Role, {
  foreignKey: 'role_id',
  targetKey: "id",
});

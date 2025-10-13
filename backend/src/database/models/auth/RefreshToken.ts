import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";
import { User } from "./User";

export interface RefreshTokenI {
  id?: number;
  token: string;
  device_info?: string;
  is_valid?: "ACTIVE" | "INACTIVE";
  expires_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  user_id: number;
}

export class RefreshToken extends Model<RefreshTokenI> implements RefreshTokenI {
  public id!: number;
  public token!: string;
  public device_info?: string;
  public is_valid!: "ACTIVE" | "INACTIVE";
  public expires_at?: Date;
  public created_at?: Date;
  public updated_at?: Date;
  public user_id!: number;
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    device_info: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_valid: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "RefreshToken",
    tableName: "refresh_tokens",
    timestamps: true,
    underscored: true,
  }
);

// named export via the class declaration above

// Relaciones
RefreshToken.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(RefreshToken, { foreignKey: "user_id", as: "refreshTokens" });

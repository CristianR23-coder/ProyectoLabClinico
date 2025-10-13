// src/models/Doctor.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../db";
import bcrypt from 'bcryptjs';
import { User } from "./auth/User";
import { Role } from "./auth/Role";
import { RoleUser } from "./auth/RoleUser";

export interface DoctorI {
  id?: number;
  docType?: string;
  docNumber: string;
  name: string;
  specialty?: string;
  medicalLicense?: string;
  phone?: string;
  email?: string;
  user_id?: number | null; // foreign key
  status: "ACTIVE" | "INACTIVE";
}

export class Doctor extends Model<DoctorI> implements DoctorI {
  public id!: number;
  public docType?: string;
  public docNumber!: string;
  public name!: string;
  public specialty?: string;
  public medicalLicense?: string;
  public phone?: string;
  public email?: string;
  public user_id?: number | null;
  public status!: "ACTIVE" | "INACTIVE";
}

Doctor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    docType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    docNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    specialty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    medicalLicense: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: { msg: "Must be a valid email" },
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users", // nombre de la tabla User
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    sequelize,
    modelName: "Doctor",
    tableName: "doctors",
    timestamps: false,
  }
);

// Relaciones
User.hasOne(Doctor, {
  foreignKey: "user_id",
  sourceKey: "id",
});

Doctor.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
});

// Hook: crear usuario automáticamente al crear un doctor si no se proporcionó user_id
Doctor.afterCreate(async (doctor, options) => {
  try {
    if (doctor.user_id) return;

    const name = doctor.name || '';
    const usernameBase = `${name}`.replace(/\s+/g, '').normalize('NFD').replace(/[^\w]/g, '').toLowerCase();
    let username = usernameBase;
    let suffix = 1;

    // Asegurar username único
    while (await User.findOne({ where: { username } })) {
      username = `${usernameBase}${suffix++}`;
    }

    const hashed = await bcrypt.hash(String(doctor.docNumber), 8);

    const user = await User.create({ username, password: hashed, role: 'DOCTOR', status: 'ACTIVE' } as any);

    // Vincular role_users si existe el rol
    try {
      const roleModel = await Role.findOne({ where: { name: user.role } });
      if (roleModel) {
        await RoleUser.create({ role_id: roleModel.id, user_id: user.id, is_active: 'ACTIVE' } as any);
      }
    } catch (err) {
      console.warn('Warning: could not create RoleUser link for doctor', err);
    }

    // Actualizar FK en doctor
    await doctor.update({ user_id: user.id } as any);
  } catch (err) {
    console.warn('Doctor.afterCreate hook failed', err);
  }
});

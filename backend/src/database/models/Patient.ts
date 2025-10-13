// src/models/Patient.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../db";
import bcrypt from 'bcryptjs';
import { Insurance } from "./Insurance";
import { User } from "./auth/User";
import { Role } from "./auth/Role";
import { RoleUser } from "./auth/RoleUser";

export type ActiveState = "ACTIVE" | "INACTIVE";

export interface PatientI {
  id?: number;

  docType: string;
  docNumber: string;

  firstName: string;
  lastName: string;

  birthDate?: Date | null;
  gender?: string | null;

  phone?: string | null;
  email?: string | null;
  address?: string | null;

  userId?: number | null;

  status: ActiveState;
}

export class Patient extends Model<PatientI> implements PatientI {
  public id!: number;

  public docType!: string;
  public docNumber!: string;

  public firstName!: string;
  public lastName!: string;

  public birthDate?: Date | null;
  public gender?: string | null;

  public phone?: string | null;
  public email?: string | null;
  public address?: string | null;
  public userId?: number | null;

  public status!: ActiveState;
}

Patient.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    docType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    docNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
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
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    sequelize,
    modelName: "Patient",
    tableName: "patients",
    timestamps: false,
  }
);

// ────────────────────────────
// Relaciones
// ────────────────────────────
User.hasMany(Patient, {
  foreignKey: "userId",
  sourceKey: "id",
});
Patient.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
});

// Hook: crear usuario automáticamente al crear un paciente si no se proporcionó userId
Patient.afterCreate(async (patient, options) => {
  try {
    if (patient.userId) return;

    const firstname = patient.firstName || '';
    const lastname = patient.lastName || '';
    const usernameBase = `${firstname}${lastname}`.replace(/\s+/g, '').normalize('NFD').replace(/[^\w]/g, '').toLowerCase();
    let username = usernameBase;
    let suffix = 1;

    // Asegurar username único
    while (await User.findOne({ where: { username } })) {
      username = `${usernameBase}${suffix++}`;
    }

    const hashed = await bcrypt.hash(String(patient.docNumber), 8);

    const user = await User.create({ username, password: hashed, role: 'PATIENT', status: 'ACTIVE' } as any);

    // Vincular role_users si existe el rol
    try {
      const roleModel = await Role.findOne({ where: { name: user.role } });
      if (roleModel) {
        await RoleUser.create({ role_id: roleModel.id, user_id: user.id, is_active: 'ACTIVE' } as any);
      }
    } catch (err) {
      console.warn('Warning: could not create RoleUser link for patient', err);
    }

    // Actualizar FK en patient
    await patient.update({ userId: user.id } as any);
  } catch (err) {
    console.warn('Patient.afterCreate hook failed', err);
  }
});


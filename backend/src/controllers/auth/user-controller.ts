import { Request, Response } from "express";
import { Op } from "sequelize";
import { User, UserI } from "../../database/models/auth/User";
import bcrypt from 'bcryptjs';
import { Role } from '../../database/models/auth/Role';
import { RoleUser } from '../../database/models/auth/RoleUser';
import { RefreshToken } from '../../database/models/auth/RefreshToken';
import { Patient } from '../../database/models/Patient';
import { Doctor } from '../../database/models/Doctor';

export class UserController {
  // Obtener todos los usuarios con estado "ACTIVE"
  public async getAllUsers(req: Request, res: Response) {
    try {
      const users: UserI[] = await User.findAll({
        where: { status: "ACTIVE" },
      });
      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ error: "No se encuentran los usuarios vale mia" });
    }
  }

  // Crear un nuevo usuario (admin)
  public async createUser(req: Request, res: Response) {
    try {
      const { username, password, role, status } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'username and password are required' });
      }

      // verificar si ya existe username
      const exists = await User.findOne({ where: { username } });
      if (exists) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      const hashed = await bcrypt.hash(String(password), 8);

      const newUser = await User.create({
        username,
        password: hashed,
        role: role ?? 'PATIENT',
        status: status ?? 'ACTIVE',
      } as any);

      // intentar crear enlace en role_users si existe el rol
      try {
        const roleModel = await Role.findOne({ where: { name: newUser.role } });
        if (roleModel) {
          await RoleUser.create({ role_id: roleModel.id, user_id: newUser.id, is_active: 'ACTIVE' } as any);
        }
      } catch (err) {
        // no bloquear creación de usuario si falla el enlace
        console.warn('Warning: could not create RoleUser link', err);
      }

      const out: any = newUser.toJSON ? newUser.toJSON() : newUser;
      if (out.password) delete out.password;

      return res.status(201).json({ user: out });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: error.message || 'Error creating user' });
    }
  }

  // Actualizar un usuario
  public async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { username, password, role, status } = req.body as Partial<UserI> & { password?: string };

      const user = await User.findByPk(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (username && username !== user.username) {
        const exists = await User.findOne({
          where: {
            username,
            id: { [Op.ne]: id },
          },
        });
        if (exists) {
          res.status(409).json({ error: "Username already exists" });
          return;
        }
      }

      let newPassword: string | undefined;
      if (password) {
        newPassword = await bcrypt.hash(String(password), 8);
      }

      let roleRecord: Role | null = null;
      if (role) {
        roleRecord = await Role.findOne({ where: { name: role } });
        if (!roleRecord) {
          res.status(400).json({ error: "Role does not exist" });
          return;
        }
      }

      const updates: Partial<UserI> & { password?: string } = {};
      if (username) updates.username = username;
      if (role) updates.role = role;
      if (status) updates.status = status;
      if (newPassword) updates.password = newPassword;

      await user.update(updates as any);

      if (roleRecord) {
        const activeRoleUser = await RoleUser.findOne({ where: { user_id: user.id, is_active: "ACTIVE" } });
        if (activeRoleUser) {
          await activeRoleUser.update({ role_id: roleRecord.id });
        } else {
          await RoleUser.create({ role_id: roleRecord.id, user_id: user.id, is_active: "ACTIVE" } as any);
        }
      }

      const out: any = user.toJSON ? user.toJSON() : user;
      if (out.password) delete out.password;

      res.status(200).json({ user: out });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Error updating user" });
    }
  }

  // Obtener un usuario por ID
  public async getUserById(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const user = await User.findOne({
        where: {
          id: pk,
          status: "ACTIVE",
        },
      });
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: "User not found or inactive" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching user" });
    }
  }

  // Eliminar un usuario de forma física
  public async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Limpiar relaciones dependientes antes de eliminar
      await Promise.all([
        RoleUser.destroy({ where: { user_id: user.id } }),
        RefreshToken.destroy({ where: { user_id: user.id } }),
        Patient.update({ userId: null }, { where: { userId: user.id } }),
        Doctor.update({ user_id: null }, { where: { user_id: user.id } }),
      ]);

      await user.destroy();
      res.status(204).json({ message: "User deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error deleting user" });
    }
  }

  // Eliminar un usuario lógicamente (marcar como INACTIVE)
  public async deleteUserAdv(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await User.findOne({ where: { id, status: "ACTIVE" } });

      if (!user) {
        res.status(404).json({ error: "User not found or already inactive" });
        return;
      }

      await Promise.all([
        RoleUser.update({ is_active: "INACTIVE" } as any, { where: { user_id: user.id } }),
        RefreshToken.destroy({ where: { user_id: user.id } }),
        Patient.update({ status: "INACTIVE" } as any, { where: { userId: user.id } }),
        Doctor.update({ status: "INACTIVE" } as any, { where: { user_id: user.id } }),
      ]);

      await user.update({ status: "INACTIVE" } as any);

      res.status(200).json({ message: "User marked as inactive" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error deactivating user" });
    }
  }
}

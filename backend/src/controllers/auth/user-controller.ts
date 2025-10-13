import { Request, Response } from "express";
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
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error deleting user" });
    }
  }
}

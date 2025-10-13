import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../../database/models/auth/User';
import { RefreshToken } from '../../database/models/auth/RefreshToken';

export class AuthController {
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, status, avatar, role } = req.body;
      if (!password) {
        res.status(400).json({ error: 'Password is required' });
        return;
      }
      const hashedPassword = await bcrypt.hash(String(password), 8);
      const user_interface: any = await User.create({
        username,
        // role en el modelo es obligatorio; usar valor por defecto si no viene
        role: role ?? 'PATIENT',
        status: status ?? 'ACTIVE',
        password: hashedPassword,
      } as any);
      const token = user_interface.generateToken();
      res.status(201).json({ user: user_interface, token });
    } catch (error) {
      res.status(500).json({ error: 'Error al registrar el usuario' });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, email } = req.body;
      // permitir login por username o email (según lo que el cliente envíe)
      const whereClause: any = {};
      if (email) whereClause.email = email;
      if (username) whereClause.username = username;
      whereClause.status = 'ACTIVE';

      const user: any | null = await User.findOne({ where: whereClause });
      if (!user || !(await user.checkPassword(password))) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      const token = user.generateToken();
      const { token: refreshToken, expiresAt } = user.generateRefreshToken();

      await RefreshToken.create({
        user_id: user.id,
        token: refreshToken,
        device_info: req.headers['user-agent'] || 'unknown',
        is_valid: 'ACTIVE',
        expires_at: expiresAt,
      } as any);

      res.status(200).json({ user, token, refreshToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }

  public async logout(req: Request, res: Response): Promise<any> {
    try {
      // Se acepta el refresh token en el body, query o en la cabecera Authorization
      const providedToken = (req.body?.refreshToken as string) || (req.query?.refreshToken as string) || (req.headers['authorization'] ? String(req.headers['authorization']).split(' ')[1] : undefined);
      const { userId, all } = req.body;

      if (providedToken) {
        const rt = await RefreshToken.findOne({ where: { token: providedToken } });
        if (!rt) return res.status(404).json({ error: 'Refresh token not found' });

        await rt.update({ is_valid: 'INACTIVE' } as any);
        return res.status(200).json({ message: 'Logged out (refresh token invalidated)' });
      }

      if (all && userId) {
        await RefreshToken.update({ is_valid: 'INACTIVE' } as any, { where: { user_id: userId } });
        return res.status(200).json({ message: 'Logged out from all devices' });
      }

      return res.status(400).json({ error: 'refreshToken or (userId and all=true) required' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error during logout' });
    }
  }
}

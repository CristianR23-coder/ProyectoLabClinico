import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import { User } from '../database/models/auth/User';
import { Role } from '../database/models/auth/Role';
import { RoleUser } from '../database/models/auth/RoleUser';
import { Resource } from '../database/models/auth/Resource';
import { ResourceRole } from '../database/models/auth/ResourceRole';

const normalizePath = (input: string): string => {
  let path = input || '/';
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  path = path.replace(/\/{2,}/g, '/');
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  if (!path) {
    return '/';
  }
  return path;
};

const resolveRouteSignature = (req: Request): { path: string; method: string } => {
  const method = req.method.toUpperCase();
  const base = req.baseUrl ?? '';
  const routePath = req.route?.path;

  if (routePath) {
    const pattern = Array.isArray(routePath) ? routePath[0] : routePath;
    if (typeof pattern === 'string') {
      const combined = `${base}${pattern}`;
      return { path: normalizePath(combined), method };
    }
  }

  const original = (req.originalUrl ?? '').split('?')[0];
  return { path: normalizePath(original || base), method };
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Acceso denegado: No se proporcionó el token principal.' });
    return;
  }

  try {
    // Verificar si el token principal es válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as jwt.JwtPayload;

    // Buscar el usuario en la base de datos
    const user: User | null = await User.findOne({ where: { id: decoded.id, status: 'ACTIVE' } });
    if (!user) {
      res.status(401).json({ error: 'Usuario no encontrado o inactivo.' });
      return;
    }

    const { path, method } = resolveRouteSignature(req);
    const resource = await Resource.findOne({
      where: { path, method, is_active: 'ACTIVE' },
    });

    if (!resource) {
      res.status(403).json({ error: `El recurso ${method} ${path} no está registrado o está inactivo.` });
      return;
    }

    const roleLinks = await RoleUser.findAll({
      where: { user_id: user.id, is_active: 'ACTIVE' },
      include: [{ model: Role, attributes: ['id', 'name'], where: { is_active: 'ACTIVE' }, required: false }],
    });

    const roleIdsSet = new Set<number>();
    const roleNamesSet = new Set<string>();

    for (const link of roleLinks) {
      if (link.role_id) {
        roleIdsSet.add(link.role_id);
      }
      const linkedRole = (link as any).Role as Role | undefined;
      if (linkedRole?.name) {
        roleNamesSet.add(linkedRole.name);
      }
    }

    if (!roleIdsSet.size && user.role) {
      const fallbackRole = await Role.findOne({ where: { name: user.role, is_active: 'ACTIVE' } });
      if (fallbackRole) {
        roleIdsSet.add(fallbackRole.id);
        roleNamesSet.add(fallbackRole.name);
      }
    }

    const roleIds = Array.from(roleIdsSet);
    const roleNames = Array.from(roleNamesSet);

    if (!roleIds.length) {
      res.status(403).json({ error: 'El usuario no tiene roles activos asociados.' });
      return;
    }

    const hasAccess = await ResourceRole.findOne({
      where: {
        resource_id: resource.id,
        role_id: { [Op.in]: roleIds },
        is_active: 'ACTIVE',
      },
    });

    if (!hasAccess) {
      res.status(403).json({
        error: 'No cuentas con permisos para acceder a este recurso.',
        details: { resource: `${method} ${path}`, roles: roleNames },
      });
      return;
    }

    (req as any).authUser = {
      id: user.id,
      username: user.username,
      roles: roleNames.length ? roleNames : [user.role],
    };

    // Continuar con la solicitud
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'El token principal ha expirado.' });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Token inválido.' });
    } else {
      res.status(500).json({ error: 'Error interno del servidor.', details: error.message });
    }
  }
};

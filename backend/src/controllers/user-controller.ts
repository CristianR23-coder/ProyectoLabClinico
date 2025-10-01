import { Request, Response } from "express";
import { User, UserI } from "../database/models/User";

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
}

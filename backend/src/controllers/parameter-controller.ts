import { Request, Response } from "express";
import { Parameter, ParameterI } from "../database/models/Parameter";

export class ParameterController {
  // Obtener todos los parámetros
  public async getAllParameters(req: Request, res: Response) {
    try {
      const parameters: ParameterI[] = await Parameter.findAll({
        where: { status: "ACTIVE" },
      });
      res.status(200).json({ parameters });
    } catch (error) {
      res.status(500).json({ error: "Error fetching parameters" });
    }
  }

  // Obtener un parámetro por ID
  public async getParameterById(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const parameter = await Parameter.findOne({
        where: { id: pk, status: "ACTIVE" },
      });
      if (parameter) {
        res.status(200).json(parameter);
      } else {
        res.status(404).json({ error: "Parameter not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching parameter" });
    }
  }
}

import { Request, Response } from "express";
import { Result, ResultI } from "../database/models/Result";

export class ResultController {
  // Obtener todos los resultados con estado distinto de "RECHAZADO"
  public async getAllResults(req: Request, res: Response) {
    try {
      const results: ResultI[] = await Result.findAll({
        where: {
          status: "ACTIVE",
          resultState: ["PENDIENTE", "VALIDADO"],
        },
      });
      res.status(200).json({ results });
    } catch (error) {
      res.status(500).json({ error: "Error fetching results" });
    }
  }

  // Obtener un resultado por ID
  public async getResultById(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const result = await Result.findOne({
        where: {
          id: pk,
          status: "ACTIVE",
          resultState: ["PENDIENTE", "VALIDADO"]
        },
      });
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ error: "Result not found or rejected" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching result" });
    }
  }
}
